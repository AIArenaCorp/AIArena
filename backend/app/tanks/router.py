from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.tanks.session import TankSession
import asyncio

router = APIRouter(prefix="/ws", tags=["tanks"])

sessions: dict[str, TankSession] = {}


@router.websocket("/tanks/{session_id}")
async def tanks_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    sessions[session_id] = TankSession(session_id)

    async def game_loop():
        try:
            while True:
                session = sessions.get(session_id)
                if not session:
                    break
                session.tick()
                await websocket.send_json(session.serialize())
                await asyncio.sleep(1 / 60)
        except Exception:
            pass

    loop_task = asyncio.create_task(game_loop())

    try:
        while True:
            data = await websocket.receive_json()
            session = sessions.get(session_id)
            if session:
                session.handle_input(data)
    except WebSocketDisconnect:
        pass
    finally:
        loop_task.cancel()
        sessions.pop(session_id, None)


@router.post("/tanks/reset/{session_id}")
async def reset_tank_session(session_id: str):
    if session_id in sessions:
        sessions[session_id] = TankSession(session_id)
    return {"ok": True}