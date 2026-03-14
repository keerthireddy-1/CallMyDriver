from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.sockets import manager  # This imports the connection manager you built

router = APIRouter()

@router.websocket("/{booking_id}/{role}")
async def location_tracking(websocket: WebSocket, booking_id: str, role: str):
    """
    Role must be either 'driver' or 'user'.
    """
    await manager.connect(websocket, booking_id, role)
    
    try:
        while True:
            # Wait for incoming messages (GPS coordinates)
            data = await websocket.receive_json()
            
            # If the driver sends a location, broadcast it to the user
            if role == "driver":
                await manager.broadcast_location(booking_id, data)
                
    except WebSocketDisconnect:
        manager.disconnect(booking_id, role)