from abc import ABC, abstractmethod


class Game(ABC):
    def __init__(self):
        self.gamestate = None

    @abstractmethod
    def reset(self):
        pass

    @abstractmethod
    def play_turn(self, move):
        pass
