import math
from typing import Dict, Any, Optional

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 # Earth's radius
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 2)

def find_best_driver(user_lat, user_lng, active_drivers):
    if not active_drivers: return None
    best_driver, min_dist = None, float('inf')
    for d_id, info in active_drivers.items():
        if info.get("lat") == 0: continue
        dist = calculate_distance(user_lat, user_lng, info['lat'], info['lng'])
        if dist < min_dist:
            min_dist = dist
            best_driver = {"driver_id": d_id, "driver_name": info['driver_name'], "distance_km": dist}
    return best_driver