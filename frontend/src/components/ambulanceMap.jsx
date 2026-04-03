import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Verified hospital coords (Google Places, April 2026) ──────────────────────
const HOSPITALS = {
  H001: { name: "Ruby Hall Clinic",  coords: [18.5335842, 73.8771566] },
  H002: { name: "KEM Hospital",      coords: [18.5199723, 73.8669765] },
  H003: { name: "Jehangir Hospital", coords: [18.5303207, 73.8768111] },
};

const DEFAULT_CENTER = [18.5304, 73.8768];
const CONNECT_RADIUS_M = 50; // metres — snap together when this close

// ── Route polyline styles ─────────────────────────────────────────────────────
const REMAINING_CASING  = { color: "#1a1a2e", weight: 11, opacity: 0.80, lineCap: "round", lineJoin: "round", interactive: false };
const REMAINING_TOP     = { color: "#4A90D9", weight:  7, opacity: 0.45, lineCap: "round", lineJoin: "round", interactive: false };
const TRAVELLED_CASING  = { color: "#1a1a2e", weight: 11, opacity: 0.90, lineCap: "round", lineJoin: "round", interactive: false };
const TRAVELLED_TOP     = { color: "#1565C0", weight:  7, opacity: 1.00, lineCap: "round", lineJoin: "round", interactive: false };
// Patient walk path — green dashed
const PATIENT_WALK_STYLE = { color: "#059669", weight: 4, opacity: 0.85, lineCap: "round", lineJoin: "round", dashArray: "8 6", interactive: false };
// Meeting point radius
const MEETING_CIRCLE_STYLE = { color: "#f59e0b", weight: 2, fillColor: "#fbbf24", fillOpacity: 0.18, interactive: false };

// ── SVG icons ──────────────────────────────────────────────────────────────────
const AMBULANCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="52" height="52">
  <rect x="4" y="20" width="44" height="28" rx="4" fill="#ffffff" stroke="#c53030" stroke-width="2.5"/>
  <rect x="32" y="20" width="16" height="28" rx="2" fill="#c53030"/>
  <rect x="48" y="28" width="12" height="16" rx="3" fill="#ffffff" stroke="#c53030" stroke-width="2"/>
  <rect x="26" y="26" width="3" height="10" rx="1" fill="#c53030"/>
  <rect x="22" y="29" width="11" height="3" rx="1" fill="#c53030"/>
  <circle cx="14" cy="50" r="5" fill="#1a202c" stroke="#fff" stroke-width="1.5"/>
  <circle cx="14" cy="50" r="2" fill="#4a5568"/>
  <circle cx="46" cy="50" r="5" fill="#1a202c" stroke="#fff" stroke-width="1.5"/>
  <circle cx="46" cy="50" r="2" fill="#4a5568"/>
  <rect x="50" y="22" width="8" height="5" rx="1" fill="#fefcbf" opacity="0.95"/>
</svg>`;

const HOSPITAL_IDLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="36" height="36">
  <circle cx="22" cy="22" r="20" fill="#3182ce" stroke="#fff" stroke-width="2"/>
  <rect x="18" y="11" width="4" height="22" rx="1.5" fill="white"/>
  <rect x="11" y="18" width="22" height="4" rx="1.5" fill="white"/>
</svg>`;

const HOSPITAL_CHOSEN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="52" height="52">
  <circle cx="30" cy="30" r="28" fill="none" stroke="#16a34a" stroke-width="3" opacity="0.35"/>
  <circle cx="30" cy="30" r="22" fill="#16a34a" stroke="#fff" stroke-width="2.5"/>
  <rect x="26" y="14" width="4.5" height="24" rx="2" fill="white"/>
  <rect x="14" y="22" width="24" height="4.5" rx="2" fill="white"/>
  <circle cx="46" cy="14" r="8" fill="#fbbf24" stroke="#fff" stroke-width="2"/>
  <text x="46" y="19" text-anchor="middle" font-size="11" font-weight="bold" fill="#78350f">✓</text>
</svg>`;

const PATIENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="36" height="46">
  <path d="M20 2C11.163 2 4 9.163 4 18c0 12 16 32 16 32s16-20 16-32C36 9.163 28.837 2 20 2z" fill="#dc2626" stroke="#fff" stroke-width="2"/>
  <circle cx="20" cy="18" r="7" fill="white"/>
  <text x="20" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">P</text>
</svg>`;

// Patient walking — orange, slightly different
const PATIENT_WALKING_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="36" height="46">
  <path d="M20 2C11.163 2 4 9.163 4 18c0 12 16 32 16 32s16-20 16-32C36 9.163 28.837 2 20 2z" fill="#ea580c" stroke="#fff" stroke-width="2"/>
  <circle cx="20" cy="18" r="7" fill="white"/>
  <text x="20" y="23" text-anchor="middle" font-size="11" font-weight="bold" fill="#ea580c">W</text>
</svg>`;

// GPS blue dot
const GPS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
  <circle cx="14" cy="14" r="12" fill="#2563eb" fill-opacity="0.18" stroke="#2563eb" stroke-width="1.5"/>
  <circle cx="14" cy="14" r="6" fill="#2563eb" stroke="#fff" stroke-width="2"/>
</svg>`;

// Meeting point star
const MEETING_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="38" height="38">
  <circle cx="22" cy="22" r="20" fill="#fbbf24" stroke="#fff" stroke-width="2"/>
  <text x="22" y="29" text-anchor="middle" font-size="18">★</text>
</svg>`;

function makeIcon(svg, size, anchor) {
  return L.divIcon({ html: svg, className: "", iconSize: size, iconAnchor: anchor });
}

// ── Haversine (metres) ─────────────────────────────────────────────────────────
function haversineM([lat1, lon1], [lat2, lon2]) {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function haversineKm(a, b) { return haversineM(a, b) / 1000; }

function getNearestHospital(origin) {
  let nearest = null, minDist = Infinity;
  for (const [id, h] of Object.entries(HOSPITALS)) {
    const d = haversineKm(origin, h.coords);
    if (d < minDist) { minDist = d; nearest = id; }
  }
  return { id: nearest, dist: minDist };
}

// ── API calls ──────────────────────────────────────────────────────────────────
async function callDispatch(origin) {
  const res = await fetch("http://localhost:8000/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ambulance_id: "AMB-001", needed_resource: "ICU", origin }),
  });
  return res.json();
}

async function callRendezvous(ambulancePos, patientPos, hospitalId) {
  const res = await fetch("http://localhost:8000/rendezvous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ambulance_pos: ambulancePos,
      patient_pos:   patientPos,
      hospital_id:   hospitalId,
    }),
  });
  return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function interpolate([lat1, lon1], [lat2, lon2], t) {
  return [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t];
}

function fmtTime(secs) {
  if (secs == null) return "--";
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function parseCoordInput(str) {
  const parts = str.split(",").map(s => parseFloat(s.trim()));
  if (
    parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) &&
    parts[0] >= -90 && parts[0] <= 90 && parts[1] >= -180 && parts[1] <= 180
  ) return parts;
  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function AmbulanceMap() {
  const mapRef        = useRef(null);
  const mapObj        = useRef(null);
  const ambulanceRef  = useRef(null);
  const animFrame     = useRef(null);
  const chosenHospRef = useRef(null);

  // GPS refs
  const gpsWatchId    = useRef(null);
  const gpsMarker     = useRef(null);
  const gpsCircle     = useRef(null);

  // Ambulance route polylines (4-layer double stack)
  const remCasing = useRef(null);
  const remTop    = useRef(null);
  const trvCasing = useRef(null);
  const trvTop    = useRef(null);

  // Patient + rendezvous layers
  const patientMarker    = useRef(null);
  const patientWalkLine  = useRef(null);
  const meetingMarker    = useRef(null);
  const meetingCircle    = useRef(null);

  const hospitalMarkers = useRef({});

  // Animation state refs (avoid stale closures)
  const currentAmbPos    = useRef(null);
  const currentPatPos    = useRef(null);
  const assignedHospId   = useRef(null);
  const rvActive         = useRef(false);
  const rvCoords         = useRef(null);        // ambulance route to meeting point
  const patWalkCoords    = useRef(null);        // patient walk path
  const patAnimFrame     = useRef(null);
  const patStartTime     = useRef(null);
  const patStartPos      = useRef(null);
  const patTargetPos     = useRef(null);
  const patWalkDuration  = useRef(0);

  const [patientLocation, setPatientLocation] = useState(null);
  const [coordInput,      setCoordInput]      = useState("");
  const [coordError,      setCoordError]      = useState("");
  const [status,          setStatus]          = useState("idle");
  const [progress,        setProgress]        = useState(0);
  const [routeInfo,       setRouteInfo]       = useState(null);
  const [eta,             setEta]             = useState(null);
  const [nearestInfo,     setNearestInfo]     = useState(null);
  const [gpsCoords,       setGpsCoords]       = useState(null);
  const [gpsAccuracy,     setGpsAccuracy]     = useState(null);
  const [gpsError,        setGpsError]        = useState("");
  const [rvInfo,          setRvInfo]          = useState(null);      // rendezvous data
  const [connected,       setConnected]       = useState(false);

  // ── Clear ambulance route polylines ───────────────────────────────────────
  const clearRoute = useCallback(() => {
    [remCasing, remTop, trvCasing, trvTop].forEach(r => {
      if (r.current && mapObj.current) { mapObj.current.removeLayer(r.current); r.current = null; }
    });
  }, []);

  // ── Clear rendezvous layers ────────────────────────────────────────────────
  const clearRV = useCallback(() => {
    if (patientWalkLine.current && mapObj.current) {
      mapObj.current.removeLayer(patientWalkLine.current); patientWalkLine.current = null;
    }
    if (meetingMarker.current && mapObj.current) {
      mapObj.current.removeLayer(meetingMarker.current); meetingMarker.current = null;
    }
    if (meetingCircle.current && mapObj.current) {
      mapObj.current.removeLayer(meetingCircle.current); meetingCircle.current = null;
    }
    rvActive.current = false;
  }, []);

  // ── Place static patient pin ───────────────────────────────────────────────
  const placePatient = useCallback((coords) => {
    if (!mapObj.current) return;
    if (patientMarker.current) mapObj.current.removeLayer(patientMarker.current);
    patientMarker.current = L.marker(coords, {
      icon: makeIcon(PATIENT_SVG, [36, 46], [18, 46]),
      zIndexOffset: 900,
    })
      .addTo(mapObj.current)
      .bindPopup(`<b>Patient</b><br/>${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`)
      .openPopup();
    setPatientLocation(coords);
    currentPatPos.current = coords;
    const { id, dist } = getNearestHospital(coords);
    setNearestInfo({ id, dist: dist.toFixed(1) });
    mapObj.current.setView(coords, 15, { animate: true });
  }, []);

  // ── GPS tracking ───────────────────────────────────────────────────────────
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError("Geolocation not supported."); return; }
    setGpsError("");

    const onSuccess = (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      const coords = [lat, lng];
      setGpsCoords(coords);
      setGpsAccuracy(Math.round(accuracy));

      if (!mapObj.current) return;
      if (gpsMarker.current) {
        gpsMarker.current.setLatLng(coords);
      } else {
        gpsMarker.current = L.marker(coords, {
          icon: makeIcon(GPS_SVG, [28, 28], [14, 14]),
          zIndexOffset: 800,
        }).addTo(mapObj.current).bindPopup(`<b>Your location</b><br/>±${Math.round(accuracy)}m`);
      }
      if (gpsCircle.current) {
        gpsCircle.current.setLatLng(coords).setRadius(accuracy);
      } else {
        gpsCircle.current = L.circle(coords, { radius: accuracy, color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08, weight: 1 }).addTo(mapObj.current);
      }
    };

    const onError = (err) => {
      const msgs = { 1: "Location access denied.", 2: "Location unavailable.", 3: "Request timed out." };
      setGpsError(msgs[err.code] || "Unknown location error.");
    };

    const opts = { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);
    gpsWatchId.current = navigator.geolocation.watchPosition(onSuccess, onError, opts);
  }, []);

  const stopGPS = useCallback(() => {
    if (gpsWatchId.current !== null) { navigator.geolocation.clearWatch(gpsWatchId.current); gpsWatchId.current = null; }
    [gpsMarker, gpsCircle].forEach(r => { if (r.current && mapObj.current) { mapObj.current.removeLayer(r.current); r.current = null; } });
    setGpsCoords(null); setGpsAccuracy(null);
  }, []);

  const useGPSAsPatient = useCallback(() => { if (gpsCoords) placePatient(gpsCoords); }, [gpsCoords, placePatient]);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapObj.current) return;
    const map = L.map(mapRef.current, { center: DEFAULT_CENTER, zoom: 14, zoomControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    Object.entries(HOSPITALS).forEach(([id, h]) => {
      hospitalMarkers.current[id] = L.marker(h.coords, {
        icon: makeIcon(HOSPITAL_IDLE_SVG, [36, 36], [18, 18]),
        zIndexOffset: 500,
      }).addTo(map).bindPopup(`<b>🏥 ${h.name}</b><br/><small>${h.coords[0].toFixed(5)}, ${h.coords[1].toFixed(5)}</small>`);
    });
    ambulanceRef.current = L.marker(DEFAULT_CENTER, {
      icon: makeIcon(AMBULANCE_SVG, [52, 52], [26, 44]),
      zIndexOffset: 1000,
      opacity: 0,
    }).addTo(map);
    map.on("click", e => placePatient([e.latlng.lat, e.latlng.lng]));
    mapObj.current = map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapObj.current) return;
    mapObj.current.off("click");
    if (status !== "moving") mapObj.current.on("click", e => placePatient([e.latlng.lat, e.latlng.lng]));
  }, [status, placePatient]);

  useEffect(() => () => { if (gpsWatchId.current !== null) navigator.geolocation.clearWatch(gpsWatchId.current); }, []);

  // ── Hospital icon helpers ──────────────────────────────────────────────────
  const resetChosenIcon = useCallback(() => {
    const id = chosenHospRef.current;
    if (id && hospitalMarkers.current[id]) { hospitalMarkers.current[id].setIcon(makeIcon(HOSPITAL_IDLE_SVG, [36, 36], [18, 18])); chosenHospRef.current = null; }
  }, []);

  const highlightHospital = useCallback((id, name) => {
    resetChosenIcon();
    if (hospitalMarkers.current[id]) {
      hospitalMarkers.current[id].setIcon(makeIcon(HOSPITAL_CHOSEN_SVG, [52, 52], [26, 26])).bindPopup(`<b>✅ ASSIGNED: ${name}</b>`).openPopup();
      chosenHospRef.current = id;
    }
  }, [resetChosenIcon]);

  // ── Animate patient walking toward meeting point ───────────────────────────
  const animatePatient = useCallback((fromPos, toPos, durationMs) => {
    if (patAnimFrame.current) cancelAnimationFrame(patAnimFrame.current);
    patStartTime.current    = performance.now();
    patStartPos.current     = fromPos;
    patTargetPos.current    = toPos;
    patWalkDuration.current = durationMs;

    // Switch to walking icon
    if (patientMarker.current) {
      patientMarker.current.setIcon(makeIcon(PATIENT_WALKING_SVG, [36, 46], [18, 46]));
    }

    function step(now) {
      const t   = Math.min((now - patStartTime.current) / patWalkDuration.current, 1);
      const pos = interpolate(patStartPos.current, patTargetPos.current, t);
      if (patientMarker.current) patientMarker.current.setLatLng(pos);
      currentPatPos.current = pos;

      if (t < 1) {
        patAnimFrame.current = requestAnimationFrame(step);
      }
    }
    patAnimFrame.current = requestAnimationFrame(step);
  }, []);

  // ── Activate rendezvous mode ───────────────────────────────────────────────
  const activateRendezvous = useCallback(async () => {
    if (!currentAmbPos.current || !currentPatPos.current || !assignedHospId.current) return;

    const rv = await callRendezvous(currentAmbPos.current, currentPatPos.current, assignedHospId.current);
    if (rv.status !== "ok") return;

    setRvInfo(rv);
    rvActive.current  = true;
    rvCoords.current  = rv.ambulance_route;
    patWalkCoords.current = rv.patient_straight;

    // Draw patient walk path (green dashed)
    if (patientWalkLine.current) mapObj.current.removeLayer(patientWalkLine.current);
    patientWalkLine.current = L.polyline(rv.patient_straight, PATIENT_WALK_STYLE).addTo(mapObj.current);

    // Draw meeting point marker + circle
    if (meetingMarker.current) mapObj.current.removeLayer(meetingMarker.current);
    if (meetingCircle.current) mapObj.current.removeLayer(meetingCircle.current);

    meetingCircle.current = L.circle(rv.meeting_point, { ...MEETING_CIRCLE_STYLE, radius: 80 }).addTo(mapObj.current);
    meetingMarker.current = L.marker(rv.meeting_point, {
      icon: makeIcon(MEETING_SVG, [38, 38], [19, 19]),
      zIndexOffset: 950,
    }).addTo(mapObj.current).bindPopup(
      `<b>⭐ Meeting point</b><br/>Ambulance ETA: ${fmtTime(rv.ambulance_eta_s)}<br/>Patient walk: ${fmtTime(rv.patient_eta_s)}<br/><span style="color:#059669">Time saved: ${fmtTime(rv.time_saved_s)}</span>`
    ).openPopup();

    // Animate patient walking to meeting point
    const walkMs = rv.patient_eta_s * 1000 * (16000 / Math.max(rv.ambulance_eta_s * 1000, 1));
    animatePatient(currentPatPos.current, rv.meeting_point, Math.min(walkMs, 16000));

  }, [animatePatient]);

  // ── Main dispatch ──────────────────────────────────────────────────────────
  const handleDispatch = async () => {
    if (!patientLocation) { setCoordError("Set patient location first."); return; }
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    if (patAnimFrame.current) cancelAnimationFrame(patAnimFrame.current);

    setStatus("loading");
    setProgress(0);
    setEta(null);
    setRouteInfo(null);
    setRvInfo(null);
    setConnected(false);
    resetChosenIcon();
    clearRoute();
    clearRV();
    rvActive.current = false;

    ambulanceRef.current.setLatLng(patientLocation);
    ambulanceRef.current.setOpacity(1);

    try {
      const data = await callDispatch(patientLocation);
      if (data.status !== "assigned") { setStatus("idle"); alert("No hospitals available!"); return; }

      // OSRM coords are [lng,lat] — flip to [lat,lng]
      const rawCoords = data.route.routes[0].geometry.coordinates;
      const coords    = rawCoords.map(([lng, lat]) => [lat, lng]);
      const duration  = Math.round(data.route.routes[0].duration);
      const distance  = (data.route.routes[0].distance / 1000).toFixed(2);

      setRouteInfo({ duration, distance, name: data.hospital_name });
      setEta(duration);
      setStatus("moving");
      highlightHospital(data.hospital_id, data.hospital_name);
      assignedHospId.current = data.hospital_id;

      // Draw ambulance route
      remCasing.current = L.polyline(coords, REMAINING_CASING).addTo(mapObj.current);
      remTop.current    = L.polyline(coords, REMAINING_TOP).addTo(mapObj.current);
      trvCasing.current = L.polyline([],     TRAVELLED_CASING).addTo(mapObj.current);
      trvTop.current    = L.polyline([],     TRAVELLED_TOP).addTo(mapObj.current);

      mapObj.current.fitBounds(L.latLngBounds([patientLocation, coords[coords.length - 1]]).pad(0.25));

      const DEMO_MS  = 16000;
      const start    = performance.now();
      const totalSeg = coords.length - 1;

      function animate(now) {
        const t        = Math.min((now - start) / DEMO_MS, 1);
        const floatIdx = t * totalSeg;
        const segIdx   = Math.min(Math.floor(floatIdx), totalSeg - 1);
        const segT     = floatIdx - segIdx;

        const pos = interpolate(coords[segIdx], coords[Math.min(segIdx + 1, totalSeg)], segT);
        ambulanceRef.current.setLatLng(pos);
        currentAmbPos.current = pos;

        const travelled = [...coords.slice(0, segIdx + 1), pos];
        const remaining = [pos, ...coords.slice(segIdx + 1)];
        trvCasing.current.setLatLngs(travelled);
        trvTop.current.setLatLngs(travelled);
        remCasing.current.setLatLngs(remaining);
        remTop.current.setLatLngs(remaining);

        setProgress(Math.round(t * 100));
        setEta(Math.round(duration * (1 - t)));

        // Check proximity to patient
        if (currentPatPos.current) {
          const dist = haversineM(pos, currentPatPos.current);
          if (dist < CONNECT_RADIUS_M && !connected) {
            // Snap together
            setConnected(true);
            setStatus("connected");
            if (patAnimFrame.current) cancelAnimationFrame(patAnimFrame.current);
            if (patientMarker.current) patientMarker.current.setLatLng(pos);
            ambulanceRef.current
              .bindPopup(`<b>🤝 Patient & ambulance connected!</b><br/>Proceeding to hospital.`)
              .openPopup();
            clearRV();
            return; // stop animation — they met
          }
        }

        if (t < 1) {
          animFrame.current = requestAnimationFrame(animate);
        } else {
          setStatus("arrived");
          ambulanceRef.current.bindPopup(`<b>✅ Arrived at ${data.hospital_name}</b>`).openPopup();
        }
      }

      animFrame.current = requestAnimationFrame(animate);

    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Error contacting dispatch server. Is FastAPI running on :8000?");
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    [animFrame, patAnimFrame].forEach(f => { if (f.current) cancelAnimationFrame(f.current); });
    clearRoute();
    clearRV();
    resetChosenIcon();
    ambulanceRef.current.setOpacity(0);
    ambulanceRef.current.setLatLng(DEFAULT_CENTER);
    currentAmbPos.current = null;
    assignedHospId.current = null;
    rvActive.current = false;
    setStatus("idle");
    setProgress(0);
    setRouteInfo(null);
    setEta(null);
    setRvInfo(null);
    setConnected(false);
  };

  // ── Coord input ────────────────────────────────────────────────────────────
  const handleCoordSubmit = () => {
    setCoordError("");
    const parsed = parseCoordInput(coordInput);
    if (!parsed) { setCoordError("Format: lat, lng  —  e.g. 18.5304, 73.8768"); return; }
    placePatient(parsed);
    setCoordInput("");
  };

  const statusColor = {
    idle:      "#6b7280",
    loading:   "#d97706",
    moving:    "#059669",
    arrived:   "#2563eb",
    connected: "#7c3aed",
  }[status] || "#6b7280";

  const isLocked = status === "moving" || status === "loading" || status === "connected";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e5e7eb", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", zIndex: 1000 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🚑</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: -0.3 }}>Dispatch</span>
        </div>

        {/* GPS */}
        {!gpsCoords ? (
          <button onClick={startGPS} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            📍 Use my location
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
              GPS {gpsCoords[0].toFixed(5)}, {gpsCoords[1].toFixed(5)}
              {gpsAccuracy && <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>±{gpsAccuracy}m</span>}
            </span>
            <button onClick={useGPSAsPatient} disabled={isLocked} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: isLocked ? "not-allowed" : "pointer" }}>
              Set patient
            </button>
            <button onClick={stopGPS} style={{ background: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>
              Stop
            </button>
          </div>
        )}

        {/* Manual coord input */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            value={coordInput}
            onChange={e => { setCoordInput(e.target.value); setCoordError(""); }}
            onKeyDown={e => e.key === "Enter" && handleCoordSubmit()}
            placeholder="lat, lng"
            disabled={isLocked}
            style={{ border: coordError ? "1.5px solid #ef4444" : "1.5px solid #d1d5db", borderRadius: 7, padding: "6px 10px", fontSize: 12, width: 185, outline: "none", color: "#111827", background: isLocked ? "#f3f4f6" : "#fff" }}
          />
          <button onClick={handleCoordSubmit} disabled={isLocked} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: isLocked ? "not-allowed" : "pointer" }}>Set</button>
        </div>

        {/* Patient hint */}
        {patientLocation && (
          <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
            P: {patientLocation[0].toFixed(5)}, {patientLocation[1].toFixed(5)}
            {nearestInfo && <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: 6 }}>→ <b style={{ color: "#2563eb" }}>{HOSPITALS[nearestInfo.id]?.name}</b> ({nearestInfo.dist} km)</span>}
          </span>
        )}

        {/* Dispatch */}
        <button
          onClick={handleDispatch}
          disabled={!patientLocation || isLocked}
          style={{ marginLeft: "auto", background: (!patientLocation || isLocked) ? "#d1d5db" : "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: (!patientLocation || isLocked) ? "not-allowed" : "pointer", transition: "background 0.15s" }}
        >
          {status === "loading" ? "Routing…" : "Dispatch"}
        </button>

        {/* Rendezvous button — only visible during animation + patient set */}
        {status === "moving" && patientLocation && !rvInfo && (
          <button
            onClick={activateRendezvous}
            style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            🤝 Meet halfway
          </button>
        )}

        {/* Reset */}
        {(status === "moving" || status === "arrived" || status === "connected") && (
          <button onClick={handleReset} style={{ background: "transparent", color: "#6b7280", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>Reset</button>
        )}

        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: statusColor }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: status === "moving" ? `0 0 0 3px ${statusColor}33` : "none", animation: status === "moving" ? "blink 1s infinite" : "none" }} />
          {status === "connected" ? "Connected!" : status}
        </div>
      </div>

      {/* ── GPS ERROR ── */}
      {gpsError && <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "6px 18px", fontSize: 12, color: "#92400e" }}>⚠ {gpsError}</div>}
      {coordError && <div style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "6px 18px", fontSize: 12, color: "#dc2626" }}>⚠ {coordError}</div>}

      {/* ── RENDEZVOUS INFO BAR ── */}
      {rvInfo && (
        <div style={{ background: "#f5f3ff", borderBottom: "1px solid #ddd6fe", padding: "7px 18px", display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#4c1d95", zIndex: 999 }}>
          <span>⭐ <b>Meet-halfway active</b></span>
          <span>🚑 Ambulance: <b>{fmtTime(rvInfo.ambulance_eta_s)}</b></span>
          <span>🚶 Patient walks: <b>{fmtTime(rvInfo.patient_eta_s)}</b></span>
          <span style={{ color: "#059669", fontWeight: 700 }}>⚡ Saves {fmtTime(rvInfo.time_saved_s)}</span>
        </div>
      )}

      {/* ── ROUTE INFO BAR ── */}
      {routeInfo && !rvInfo && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "7px 18px", display: "flex", alignItems: "center", gap: 20, fontSize: 12, color: "#4b5563", zIndex: 999 }}>
          <span>🏥 <b style={{ color: "#111827" }}>{routeInfo.name}</b></span>
          <span>📍 <b style={{ color: "#111827" }}>{routeInfo.distance} km</b></span>
          <span>⏱ <b style={{ color: "#111827" }}>{fmtTime(routeInfo.duration)}</b> total</span>
          {status === "moving" && eta !== null && <span>🏁 ETA <b style={{ color: "#dc2626" }}>{fmtTime(eta)}</b></span>}
          {status === "arrived" && <span style={{ color: "#059669", fontWeight: 700 }}>✅ Arrived at {routeInfo.name}</span>}
          {status === "connected" && <span style={{ color: "#7c3aed", fontWeight: 700 }}>🤝 Patient & ambulance connected!</span>}
          <div style={{ flex: 1 }}>
            <div style={{ background: "#e5e7eb", borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: status === "arrived" || status === "connected" ? "#059669" : "#1565C0", borderRadius: 99, transition: "width 0.1s linear" }} />
            </div>
          </div>
          <b style={{ color: "#111827", minWidth: 34, textAlign: "right" }}>{progress}%</b>
        </div>
      )}

      {/* ── MAP ── */}
      <div ref={mapRef} style={{ flex: 1 }} />

      {/* ── LEGEND ── */}
      <div style={{ position: "absolute", bottom: 36, left: 16, background: "rgba(255,255,255,0.96)", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#374151", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", zIndex: 999, lineHeight: 2, border: "1px solid #e5e7eb" }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>Legend</div>
        <div>🔴 Patient (static pin)</div>
        <div>🟠 Patient walking</div>
        <div>⭐ Meeting point</div>
        <div>🔵 Hospital (available)</div>
        <div>🟢 Hospital (assigned)</div>
        <div>🚑 Ambulance</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 28, height: 4, borderRadius: 2, background: "repeating-linear-gradient(90deg,#059669 0,#059669 8px,transparent 8px,transparent 14px)" }}/>
          <span>Patient walk path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 28, height: 5, borderRadius: 3, background: "linear-gradient(90deg,#1565C0 50%,#4A90D9 50%)" }}/>
          <span>Ambulance route</span>
        </div>
        <div style={{ marginTop: 4, color: "#9ca3af", fontSize: 10 }}>Click map to set patient</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .leaflet-popup-content-wrapper { border-radius: 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.13) !important; font-family: 'DM Sans', system-ui, sans-serif !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
}