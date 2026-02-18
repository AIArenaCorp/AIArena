from fastapi import APIRouter
from backend.app.services.game_controller import GameController
from backend.app.games.connect4 import Connect4

router = APIRouter(prefix="/connect4", tags=["connect4"])

controller = GameController(Connect4)


@router.get("/board")
def get_board():
    return controller.get_board()


@router.post("/move/{column}")
def play_move(column: int):
    return controller.play_turn(column)


@router.post("/reset")
def reset_game():
    return controller.reset()
