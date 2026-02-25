from backend.app.turn_based.agents.connect4.minimax_agent import MiniMaxConnect4Agent
from backend.app.turn_based.services.game_controller import GameController
from backend.app.turn_based.games.connect4 import Connect4

def run_battle(weights_a, weights_b):
    game = GameController(Connect4)
    turn = 0
    agent1 = MiniMaxConnect4Agent("Agent 1", 1)
    agent1.update_weights(weights_a)
    agent2 = MiniMaxConnect4Agent("Agent 2", -1)
    agent2.update_weights(weights_b)
    while True:
        current_agent = agent1 if turn == 0 else agent2
        scores = current_agent.get_col_scores(game.get_board()["board"])
        if not scores:
            print("No legal moves found. Ending battle.")
            return 0.5
        result = game.play_turn(max(scores, key=scores.get))

        if result["result"][0] == "win":
            return turn
        if result["result"][0] == "tie":
            return 0.5

        turn = 0 if turn == 1 else 1


def calculate_elo(rating_a, rating_b, score_a, k=32):
    expected_a = 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
    new_rating_a = rating_a + k * (score_a - expected_a)
    new_rating_b = rating_b + k * ((1 - score_a) - (1 - expected_a))
    return round(new_rating_a), round(new_rating_b)