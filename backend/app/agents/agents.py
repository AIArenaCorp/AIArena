from abc import ABC, abstractmethod


class Agent(ABC):
    def __init__(self):
        self.weights = None
        self.name = None
    @abstractmethod
    def set_weights(self):
        pass

    @abstractmethod
    def get_next_move(self, gamestate):
        pass
