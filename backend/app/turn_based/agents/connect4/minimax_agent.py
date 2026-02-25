import copy

class MiniMaxConnect4Agent:
    # self is 1 opp is 2 empty is '' 
    ROWS = 6
    COLS = 7


    def __init__(self, name, piece = 1):
        self.name = name
        self.piece = piece
        self.weights = {'depth': 1, 'create4': 1, 'create3': 1, 'create2': 1, 'opponent4': 1, 'opponent3': 1, 'opponent2': 1}

    def update_weights(self, new_weights: dict):
        self.weights.update(new_weights)


    # runs the minimax algo and return the best move for game and al scores for each move
    def minimax(self, gamestate, depth, is_maximizing_player, alpha=-1000, beta=1000):
        # base case
        if (depth >= self.weights['depth'] or self.is_game_over(gamestate)):
            return self.eval_fun(
                gamestate,
                self.piece,
                self.weights['create4'],
                self.weights['create3'],
                self.weights['create2'],
                self.weights['opponent4'],
                self.weights['opponent3'],
                self.weights['opponent2']
            )

        moves = self.get_moves(gamestate)
        if not moves:
            return 0

        if is_maximizing_player:
            best_score = -1000
            for row, col in moves:
                gamestate[row][col] = self.piece
                score = self.minimax(gamestate, depth + 1, False, alpha, beta)
                gamestate[row][col] = 0

                best_score = max(best_score, score)
                alpha = max(alpha, best_score)

                if beta <= alpha:   # PRUNE
                    break

            return best_score

        else:
            best_score = 1000
            for row, col in moves:
                gamestate[row][col] = -self.piece
                score = self.minimax(gamestate, depth + 1, True, alpha, beta)
                gamestate[row][col] = 0

                best_score = min(best_score, score)
                beta = min(beta, best_score)

                if beta <= alpha:   # PRUNE
                    break

            return best_score

    def get_col_scores(self, gamestate):
        col_scores = {}
        moves = self.get_moves(gamestate)

        for row, col in moves:
            branch_board = copy.deepcopy(gamestate)
            branch_board[row][col] = self.piece
            score = self.minimax(branch_board, 1, False)
            col_scores[col] = score
        return col_scores

    def eval_fun(self, gamestate, player, create4_weight, create3_weight, create2_weight, opponent4_weight, opponent3_weight, opponent2_weight):
        score = 0
        windows = self.get_all_windows(gamestate)

        for window in windows:
            score += self.score_window(window, player, create4_weight, create3_weight, create2_weight)
            score -= self.score_window(window, -player, opponent4_weight, opponent3_weight, opponent2_weight)

        return score


    def score_window(self, window, player, w4, w3, w2):
        """Score a single 4-cell window for the given player."""
        player_count = window.count(player)
        empty_count = window.count(0)
        opp_count = 4 - player_count - empty_count

        if opp_count > 0:
            return 0

        if player_count == 4:
            return w4     
        elif player_count == 3:
            return w3       
        elif player_count == 2:
            return w2       
        return 0


    def get_all_windows(self, gamestate):
        """Extract every horizontal, vertical, and diagonal window of size 4."""
        windows = []

        # Horizontal
        for row in range(self.ROWS):
            for col in range(self.COLS - 3):
                windows.append([gamestate[row][col + i] for i in range(4)])

        # Vertical
        for row in range(self.ROWS - 3):
            for col in range(self.COLS):
                windows.append([gamestate[row + i][col] for i in range(4)])

        # Diagonal down-right
        for row in range(self.ROWS - 3):
            for col in range(self.COLS - 3):
                windows.append([gamestate[row + i][col + i] for i in range(4)])

        # Diagonal down-left
        for row in range(self.ROWS - 3):
            for col in range(3, self.COLS):
                windows.append([gamestate[row + i][col - i] for i in range(4)])

        return windows
            
    def is_playable(self, board, row, col):

        if not (0 <= row < self.ROWS and 0 <= col < self.COLS):
            return False

        if board[row][col] != 0:
            return False

        if row == self.ROWS - 1:
            return True

        return board[row + 1][col] != 0


    # return list of possible game positions you can ply
    def get_moves(self, gamestate):
        moves = []
        #gets all available colums, finds first empty row
        for col in range(self.COLS):
            if gamestate[0][col] == 0:
                for row in range(self.ROWS-1, -1, -1):
                    if gamestate[row][col] == 0:
                        moves.append((row, col))
                        break
        return moves


    # checks if game is over
    def is_game_over(self, gamestate):
        return self.check_winner(gamestate, 1) or self.check_winner(gamestate, -1) or self.check_tie(gamestate)
    

    # check for win
    def check_winner(self, gamestate, player):
        for row in range(self.ROWS):
            for col in range(self.COLS):
                if gamestate[row][col] != player:
                    continue
                for dr, dc in ((0, 1), (1, 0), (1, 1), (1, -1)):
                    total = 1
                    r, c = row + dr, col + dc
                    while 0 <= r < self.ROWS and 0 <= c < self.COLS and gamestate[r][c] == player:
                        total += 1
                        r += dr
                        c += dc
                    if total >= 4:
                        return True
        return False
    

    # checks for a tie 
    def check_tie(self, gamestate):
        return all(gamestate[i][j] != 0 for i in range(self.ROWS) for j in range(self.COLS))






