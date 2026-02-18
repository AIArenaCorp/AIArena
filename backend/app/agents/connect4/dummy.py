import random


class DummyConnect4Agent:
    def __init__(self, name: str):
        self.name = name
        self.weights = {"complete3": 0, "complete2": 0, "block3": 0, "block2": 0}

    def update_weights(self, new_weights: dict):
        self.weights.update(new_weights)

    def get_next_move(self, board: list[list[int]]) -> int:
        valid_moves = [c for c in range(len(board[0])) if board[0][c] == 0]

        if not valid_moves:
            return -1

        return random.choice(valid_moves)