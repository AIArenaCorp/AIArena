from typing import Type
from backend.app.games.game import Game

class GameController:
    def __init__(self, game_cls: Type[Game]):
        self._game = game_cls()

    def get_board(self):
        return {
            "board": self._game.gamestate
        }

    def play_turn(self, move: int):
        result = self._game.play_turn(move)
        return {
            "result": result,
            "board": self._game.gamestate
        }

    def reset(self):
        self._game.reset()
        return {
            "board": self._game.gamestate
        }
