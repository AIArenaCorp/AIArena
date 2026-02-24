from fastapi import APIRouter, Header
from backend.app.services.game_controller import GameController
from backend.app.games.connect4 import Connect4
import time

router = APIRouter(prefix="/connect4", tags=["connect4"])

controllers: dict[str, tuple[GameController, float]] = {}

def get_controller(session_id: str) -> GameController:
    now = time.time()

    expired = [sid for sid, (_, ts) in controllers.items() if now - ts > 7200]
    for sid in expired:
        del controllers[sid]

    if session_id not in controllers:
        controllers[session_id] = (GameController(Connect4), now)
    else:
        ctrl, _ = controllers[session_id]
        controllers[session_id] = (ctrl, now)

    return controllers[session_id][0]


@router.get("/board")
def get_board(x_session_id: str = Header(...)):
    return get_controller(x_session_id).get_board()


@router.post("/move/{column}")
def play_move(column: int, x_session_id: str = Header(...)):
    return get_controller(x_session_id).play_turn(column)


@router.post("/reset")
def reset_game(x_session_id: str = Header(...)):
    return get_controller(x_session_id).reset()