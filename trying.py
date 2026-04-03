import requests


patient_lat, patient_lon = 18.5204, 73.8567


lat_min = patient_lat - 0.05
lat_max = patient_lat + 0.05
lon_min = patient_lon - 0.05
lon_max = patient_lon + 0.05


overpass_url = "https://overpass-api.de/api/interpreter"
query = f"""
[out:json];
node["amenity"="hospital"]({lat_min},{lon_min},{lat_max},{lon_max});
out;
"""

response = requests.get(overpass_url, params={'data': query})
data = response.json()

hospitals = []
for element in data["elements"]:
    hospitals.append({
        "name": element.get("tags", {}).get("name", "unknown"),
        "lat": element["lat"],
        "lon": element["lon"]
    })

print(f"Found {len(hospitals)} hospitals nearby")
print(hospitals[:5]) 



import requests

def get_route_duration(patient, hospital):
    url = f"http://localhost:5000/route/v1/driving/{patient[1]},{patient[0]};{hospital['lon']},{hospital['lat']}"
    params = {"overview": "false"}
    res = requests.get(url, params=params).json()
    route = res['routes'][0]
    return route['duration'], route['distance']

best_hospital = None
min_duration =  271.4


# min_duration in seconds 

for hospital in hospitals:
    duration, distance = get_route_duration((patient_lat, patient_lon), hospital)
    if duration < min_duration:
        min_duration = duration
        best_hospital = hospital

print("Closest hospital by travel time:")
print(best_hospital, "ETA (s):", min_duration)

import requests

patient = (18.5204, 73.8567)  



def get_route_info(patient, hospital):
    url = f"http://localhost:5000/route/v1/driving/{patient[1]},{patient[0]};{hospital['lon']},{hospital['lat']}"
    params = {"overview": "false", "alternatives": "true"}
    res = requests.get(url, params=params).json()

    best_route = min(res['routes'], key=lambda r: r['duration'])
    
    return {
        "name": hospital['name'],
        "lat": hospital['lat'],
        "lon": hospital['lon'],
        "distance_m": best_route['distance'],
        "duration_s": best_route['duration']/60
    }

hospital_routes = [get_route_info(patient, h) for h in hospitals]

for h in hospital_routes:
    print(h)