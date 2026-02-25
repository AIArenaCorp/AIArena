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
    def minimax(self, gamestate, depth, is_maximizing_player):
        #base cases (end of tree traversal score final boarx state)
        if (depth >= self.weights['depth'] or self.is_game_over(gamestate)):
            return self.eval_fun( gamestate, self.piece, self.weights['create4'], self.weights['create3'], self.weights['create2'], self.weights['opponent4'], self.weights['opponent3'], self.weights['opponent2'])

        moves = self.get_moves(gamestate)
        if not moves:
            return 0

        #recursive call
        if is_maximizing_player:
            best_score = -1000
            for row, col in moves:
                gamestate[row][col] = self.piece
                score = self.minimax(gamestate, depth + 1, False)
                gamestate[row][col] = 0  
                best_score = max(best_score, score)
            return best_score
        else:
            best_score = 1000
            for row, col in moves:
                gamestate[row][col] = -self.piece
                score = self.minimax(gamestate, depth + 1, True)
                gamestate[row][col] = 0  
                best_score = min(best_score, score)
            return best_score

    def get_col_scores(self, gamestate):
        col_scores = {}
        moves = self.get_moves(gamestate)

        for row, col in moves:
            branch_board = copy.deepcopy(gamestate)
            branch_board[row][col] = self.piece
            score = self.minimax(branch_board, 1, False)
            col_scores[col] = score

        # print(f"weights {self.weights}")
        # print("pretty gamestate:")
        # for row in gamestate:
        #     print(row)
        # print(f"col scores: {col_scores}")
        return col_scores


    # scores a board state for the max player
    def eval_fun(self, gamestate, player, create4_weight, create3_weight, create2_weight, opponent4_weight, opponent3_weight, opponent2_weight):
        gamestate_score = 0

        gamestate_score += self.count_n_in_a_row(gamestate, player, 4) * create4_weight
        gamestate_score += self.count_n_in_a_row(gamestate, player, 3) * create3_weight
        gamestate_score += self.count_n_in_a_row(gamestate, player, 2) * create2_weight

        gamestate_score -= self.count_n_in_a_row(gamestate, -player, 4) * opponent4_weight
        gamestate_score -= self.count_n_in_a_row(gamestate, -player, 3) * opponent3_weight
        gamestate_score -= self.count_n_in_a_row(gamestate, -player, 2) * opponent2_weight
        

        return gamestate_score
    
    def count_n_in_a_row(self, gamestate, player, n):
        count = 0
        directions = [
            (0, 1),   # horizontal
            (1, 0),   # vertical
            (1, 1),   # diagonal down-right
            (1, -1)   # diagonal down-left
        ]

        for row in range(self.ROWS):
            for col in range(self.COLS):
                if gamestate[row][col] != player:
                    continue

                for dr, dc in directions:
                    # Only count sequences that START here (not mid-chain)
                    prev_r = row - dr
                    prev_c = col - dc
                    if (0 <= prev_r < self.ROWS and 
                        0 <= prev_c < self.COLS and 
                        gamestate[prev_r][prev_c] == player):
                        continue  # this is mid-chain, skip

                    # Count how long the chain actually is from here
                    length = 0
                    r, c = row, col
                    while (0 <= r < self.ROWS and 
                        0 <= c < self.COLS and 
                        gamestate[r][c] == player):
                        length += 1
                        r += dr
                        c += dc

                    if length != n:
                        continue

                    # Check open ends
                    before_r, before_c = row - dr, col - dc
                    after_r, after_c = row + n * dr, col + n * dc

                    before_playable = self.is_playable(gamestate, before_r, before_c)
                    after_playable = self.is_playable(gamestate, after_r, after_c)

                    if before_playable or after_playable:
                        count += 1

        return count
            
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






