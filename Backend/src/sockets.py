from fastapi import WebSocket
from typing import Dict, Any, List

class ConnectionManager:
    def __init__(self):
        # Tracking & Real-time
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.active_drivers: Dict[str, Dict[str, Any]] = {}
        
        # Lifecycle & State
        self.booking_statuses: Dict[str, str] = {} # {id: status}
        self.driver_to_booking: Dict[str, str] = {} # {drv_id: bkg_id}
        
        # Persistence Features (New)
        self.users_db: Dict[str, str] = {} # {username: password}
        self.all_bookings: Dict[str, Dict] = {} # Store full details for GET /bookings

    async def connect(self, websocket: WebSocket, booking_id: str, role: str):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = {}
        self.active_connections[booking_id][role] = websocket

    def disconnect(self, booking_id: str, role: str, client_id: str):
        if booking_id in self.active_connections and role in self.active_connections[booking_id]:
            del self.active_connections[booking_id][role]

    async def update_status(self, booking_id: str, status: str):
        self.booking_statuses[booking_id] = status
        if booking_id in self.all_bookings:
            self.all_bookings[booking_id]["status"] = status

    def update_live_location(self, driver_id: str, data: dict):
        if driver_id in self.active_drivers:
            self.active_drivers[driver_id].update({"lat": data.get("lat"), "lng": data.get("lng")})

    async def broadcast_to_booking(self, booking_id: str, data: dict):
        if booking_id in self.active_connections:
            for role, ws in self.active_connections[booking_id].items():
                if role == "user":
                    try: await ws.send_json(data)
                    except: pass

manager = ConnectionManager()