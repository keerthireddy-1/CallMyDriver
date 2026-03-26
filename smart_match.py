def find_nearest_driver(lat, lon):
    drivers = [
        {"id": 1, "name": "John", "lat": lat + 0.01, "lon": lon + 0.01},
        {"id": 2, "name": "Mike", "lat": lat + 0.02, "lon": lon + 0.02},
    ]
    return drivers[0] if drivers else None