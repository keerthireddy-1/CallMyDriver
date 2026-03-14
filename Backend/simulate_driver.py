import asyncio
import websockets
import json
import requests
import time

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

async def run_driver_sim():
    print("🚀 Step 1: Logging in...")
    # Start ~1.5km away
    lat, lng = 12.9820, 77.6050 
    
    resp = requests.post(f"{BASE_URL}/api/auth/driver-login", json={"name": "Arjun Singh", "lat": lat, "lng": lng}).json()
    d_id = resp["driver_id"]
    print(f"✅ Online as {d_id}.")

    # Poll for booking while updating location
    b_id = None
    while not b_id:
        try:
            # Send 'Heartbeat' update
            requests.post(f"{BASE_URL}/api/auth/driver-login", json={"name": "Arjun Singh", "lat": lat, "lng": lng})
            
            # Check for match
            r = requests.get(f"{BASE_URL}/api/driver/{d_id}/my-booking").json()
            b_id = r.get("booking_id")
            if not b_id:
                print("📡 Waiting for a user match...")
                time.sleep(2)
        except: time.sleep(2)
    
    print(f"🔔 Match Found! Booking ID: {b_id}")
    uri = f"{WS_URL}/api/tracking/{b_id}/driver/{d_id}"
    
    async with websockets.connect(uri) as ws:
        print("🟢 Tracking active. Move to Swagger and 'Accept' the ride!")
        while True:
            lat -= 0.0001; lng -= 0.0001
            await ws.send(json.dumps({"lat": lat, "lng": lng, "driver_name": "Arjun Singh"}))
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(run_driver_sim())