import math

def find_closest_active_driver(user_lat, user_lng, active_drivers: dict):
    best_driver_id = None
    min_distance = float('inf')

    for d_id, coords in active_drivers.items():
        # Haversine Distance
        R = 6371
        dlat = math.radians(coords['lat'] - user_lat)
        dlon = math.radians(coords['lng'] - user_lng)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(user_lat)) * \
            math.cos(math.radians(coords['lat'])) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c

        if distance < min_distance:
            min_distance = distance
            best_driver_id = d_id

    if best_driver_id:
        return {"driver_id": best_driver_id, "distance": round(min_distance, 2), **active_drivers[best_driver_id]}
    return None