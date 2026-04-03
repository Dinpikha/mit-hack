from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from threading import Lock
import time
import math
import httpx

app = FastAPI()

# ── Hospital state ─────────────────────────────────────────────────────────────
# Coordinates verified via Google Places API (April 2026)
hospital_state = {
    "H001": {
        "name": "Ruby Hall Clinic",
        "coords": [18.5335842, 73.8771566],
        "resources": {"ICU": {"total": 15, "confirmed": 3, "held": 0, "available": 9}},
    },
    "H002": {
        "name": "KEM Hospital",
        "coords": [18.5199723, 73.8669765],
        "resources": {"ICU": {"total": 3, "confirmed": 3, "held": 0, "available": 0}},
    },
    "H003": {
        "name": "Jehangir Hospital",
        "coords": [18.5303207, 73.8768111],
        "resources": {"ICU": {"total": 4, "confirmed": 2, "held": 0, "available": 1}},
    },
}

holds  = {}
_mutex = Lock()

# ── Speed constants ────────────────────────────────────────────────────────────
AMBULANCE_SPEED_MPS = 11.1   # ~40 km/h city driving
PATIENT_WALK_MPS    = 1.4    # ~5  km/h walking


# ── Reservation helpers ────────────────────────────────────────────────────────
def release_expired():
    now = time.time()
    for key in list(holds.keys()):
        if holds[key]["expires_at"] < now:
            h_id, resource = key.split(":")
            hospital_state[h_id]["resources"][resource]["held"]      -= 1
            hospital_state[h_id]["resources"][resource]["available"] += 1
            del holds[key]


def try_reserve(hospital_id: str, resource: str, ambulance_id: str, ttl: int = 180) -> bool:
    key = f"{hospital_id}:{resource}"
    with _mutex:
        release_expired()
        res = hospital_state[hospital_id]["resources"][resource]
        if res["available"] > 0:
            holds[key] = {"expires_at": time.time() + ttl, "ambulance_id": ambulance_id}
            res["held"]      += 1
            res["available"] -= 1
            return True
        return False


# ── Haversine (metres) ─────────────────────────────────────────────────────────
def haversine_m(a: list, b: list) -> float:
    R = 6_371_000
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(h))


# ── OSRM helpers ───────────────────────────────────────────────────────────────
# OSRM wants  lng,lat.  Our coords are  [lat,lng].  Always flip.

async def get_osrm_duration(origin: list, destination: list) -> float:
    url = (
        "http://router.project-osrm.org/table/v1/driving/"
        f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
        "?sources=0&destinations=1&annotations=duration"
    )
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            r = await client.get(url)
            d = r.json()
        val = d["durations"][0][0]
        return val if val is not None else float("inf")
    except Exception:
        return float("inf")


async def get_route(origin: list, destination: list) -> dict:
    """Full route with dense step-level geometry."""
    url = (
        "http://router.project-osrm.org/route/v1/driving/"
        f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
        "?overview=full&geometries=geojson&steps=true"
    )
    async with httpx.AsyncClient(timeout=12.0) as client:
        r = await client.get(url)
        data = r.json()

    route      = data["routes"][0]
    all_coords = []
    for step in route["legs"][0]["steps"]:
        sc = step["geometry"]["coordinates"]
        if all_coords:
            sc = sc[1:]
        all_coords.extend(sc)
    route["geometry"]["coordinates"] = all_coords
    return data


# ── Rendezvous computation ─────────────────────────────────────────────────────
def find_rendezvous_on_route(route_coords: list, ambulance_pos: list, patient_pos: list) -> dict:
    """
    Walk along the OSRM route (ambulance → original patient location) and find
    the point where:
        distance_along_route_from_ambulance / AMBULANCE_SPEED
        ==
        straight_line_from_patient / PATIENT_WALK_SPEED

    Because the patient walks toward the ambulance in a straight line (they
    cut through to the nearest road point), we approximate their travel time
    as straight-line distance / walking speed.

    Returns:
        meeting_idx    — index in route_coords of the meeting point segment
        meeting_point  — [lat, lng] of the meeting point
        ambulance_eta  — seconds for ambulance to reach meeting point
        patient_eta    — seconds for patient to reach meeting point
        time_saved_s   — seconds saved vs ambulance going all the way
        ambulance_route — coords from ambulance to meeting point
        patient_route   — two-point straight line from patient to meeting point
    """
    # Accumulate cumulative distance along route from start
    cumulative_m = [0.0]
    for i in range(1, len(route_coords)):
        # route_coords are [lat,lng]
        d = haversine_m(route_coords[i - 1], route_coords[i])
        cumulative_m.append(cumulative_m[-1] + d)

    total_route_m  = cumulative_m[-1]
    full_amb_time  = total_route_m / AMBULANCE_SPEED_MPS

    best_idx       = len(route_coords) - 1
    best_point     = route_coords[-1]
    best_amb_eta   = full_amb_time
    best_pat_eta   = haversine_m(patient_pos, route_coords[-1]) / PATIENT_WALK_MPS
    min_time_diff  = abs(best_amb_eta - best_pat_eta)

    for i, coord in enumerate(route_coords):
        amb_eta = cumulative_m[i] / AMBULANCE_SPEED_MPS
        pat_eta = haversine_m(patient_pos, coord) / PATIENT_WALK_MPS
        diff    = abs(amb_eta - pat_eta)
        if diff < min_time_diff:
            min_time_diff = diff
            best_idx      = i
            best_point    = coord
            best_amb_eta  = amb_eta
            best_pat_eta  = pat_eta

    time_saved = full_amb_time - best_amb_eta

    return {
        "meeting_point":    best_point,
        "meeting_idx":      best_idx,
        "ambulance_eta_s":  round(best_amb_eta),
        "patient_eta_s":    round(best_pat_eta),
        "time_saved_s":     round(max(time_saved, 0)),
        "ambulance_route":  route_coords[: best_idx + 1],
        "patient_straight": [patient_pos, best_point],
    }


# ── Scoring ────────────────────────────────────────────────────────────────────
async def rank_hospitals(needed_resource: str, origin: list) -> list:
    candidates = []
    for h_id, h in hospital_state.items():
        res = h["resources"].get(needed_resource, {})
        if res.get("available", 0) <= 0:
            continue
        eta = await get_osrm_duration(origin, h["coords"])
        candidates.append((eta, -res["available"], h_id))
    candidates.sort()
    return [h_id for _, _, h_id in candidates]


# ── /assign — standard dispatch ────────────────────────────────────────────────
@app.post("/assign")
async def assign(payload: dict):
    ambulance_id    = payload["ambulance_id"]
    needed_resource = payload["needed_resource"]
    origin          = payload["origin"]           # [lat, lng] — patient/incident location

    ranked = await rank_hospitals(needed_resource, origin)
    if not ranked:
        return {"status": "no_hospitals_available"}

    for h_id in ranked:
        if not try_reserve(h_id, needed_resource, ambulance_id):
            continue
        h     = hospital_state[h_id]
        dest  = h["coords"]
        route = await get_route(origin, dest)
        return {
            "status":          "assigned",
            "hospital_id":     h_id,
            "hospital_name":   h["name"],
            "hospital_coords": dest,
            "route":           route,
        }

    return {"status": "no_hospitals_available"}


# ── /rendezvous — meet-in-the-middle ──────────────────────────────────────────
@app.post("/rendezvous")
async def rendezvous(payload: dict):
    """
    Called once patient tracking is live. Given:
      - ambulance_pos: current [lat,lng] of ambulance (already en route)
      - patient_pos:   current [lat,lng] of patient (live GPS)
      - hospital_id:   which hospital was assigned

    Returns the optimal meeting point, updated ambulance route to that point,
    a straight-line walk path for the patient, and both ETAs.
    """
    ambulance_pos = payload["ambulance_pos"]   # [lat, lng]
    patient_pos   = payload["patient_pos"]     # [lat, lng]
    hospital_id   = payload.get("hospital_id", "H001")

    h    = hospital_state.get(hospital_id)
    if not h:
        return {"error": "unknown hospital_id"}

    # Get fresh route from ambulance's current position
    route_data = await get_route(ambulance_pos, patient_pos)
    route      = route_data["routes"][0]

    # route_coords are OSRM [lng,lat] — flip to [lat,lng]
    raw = route["geometry"]["coordinates"]
    route_coords = [[lat, lng] for lng, lat in raw]

    rv = find_rendezvous_on_route(route_coords, ambulance_pos, patient_pos)

    return {
        "status":             "ok",
        "meeting_point":      rv["meeting_point"],
        "ambulance_eta_s":    rv["ambulance_eta_s"],
        "patient_eta_s":      rv["patient_eta_s"],
        "time_saved_s":       rv["time_saved_s"],
        "ambulance_route":    rv["ambulance_route"],
        "patient_straight":   rv["patient_straight"],
        "full_route_duration": round(route["duration"]),
        "full_route_distance_km": round(route["distance"] / 1000, 2),
    }


# ── /debug_route ───────────────────────────────────────────────────────────────
@app.post("/debug_route")
async def debug_route(payload: dict):
    origin = payload["origin"]
    h_id   = payload.get("hospital_id", "H001")
    h      = hospital_state.get(h_id)
    if not h:
        return {"error": "unknown hospital_id"}
    dest = h["coords"]
    url  = (
        "http://router.project-osrm.org/route/v1/driving/"
        f"{origin[1]},{origin[0]};{dest[1]},{dest[0]}"
        "?overview=full&geometries=geojson&steps=false"
    )
    async with httpx.AsyncClient(timeout=12.0) as client:
        r = await client.get(url)
        data = r.json()
    route = data["routes"][0]
    return {
        "osrm_origin_sent":   f"{origin[1]}, {origin[0]}",
        "osrm_dest_sent":     f"{dest[1]}, {dest[0]}",
        "hospital_name":      h["name"],
        "duration_minutes":   round(route["duration"] / 60, 1),
        "distance_km":        round(route["distance"] / 1000, 2),
        "route_start_coord":  route["geometry"]["coordinates"][0],
        "route_end_coord":    route["geometry"]["coordinates"][-1],
    }


# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)