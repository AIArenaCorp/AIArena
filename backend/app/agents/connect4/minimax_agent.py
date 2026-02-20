import copy

class MiniMaxConnect4Agent:
    # self is 1 opp is 2 empty is '' 
    ROWS = 6
    COLS = 7


    def __init__(self, name):
        self.name = name
        self.weights = {'depth': 1, 'create4': 1, 'create3': 1, 'create2': 1, 'create1': 1, 'block4': 1, 'block3': 1, 'block2': 1, 'block1': 1}

    def update_weights(self, new_weights: dict):
        self.weights.update(new_weights)


    # runs the minimax algo and return the best move for game and al scores for each move
    def minimax(self, gamestate, depth, is_maximizing_player):
        #print(f"minimax called with depth {depth} and is_maximizing_player {is_maximizing_player}")
        #base cases (end of tree traversal score final boarx state)
        if (depth >= self.weights['depth'] or self.is_game_over(gamestate)):
            return self.eval_fun( gamestate, self.weights['create4'], self.weights['create3'], self.weights['create2'], self.weights['create1'], self.weights['block4'], self.weights['block3'], self.weights['block2'], self.weights['block1'])

        moves = self.get_moves(gamestate)
        if not moves:
            return 0
        
        #recursive call
        if is_maximizing_player:
            best_score = -1000
            for row, col in moves:
                gamestate[row][col] = 1
                score = self.minimax(gamestate, depth + 1, False)
                gamestate[row][col] = 0  
                best_score = max(best_score, score)
            return best_score
        else:
            best_score = 1000
            for row, col in moves:
                gamestate[row][col] = -1
                score = self.minimax(gamestate, depth + 1, True)
                gamestate[row][col] = 0  
                best_score = min(best_score, score)
            return best_score

    def get_col_scores(self, gamestate):
        print(f"getting scores for gamestate: {gamestate}")
        col_scores = {}
        moves = self.get_moves(gamestate)

        for row, col in moves:
            branch_board = copy.deepcopy(gamestate)
            branch_board[row][col] = 1
            score = self.minimax(branch_board, 1, False)
            col_scores[col] = score
        print(f"col scores: {col_scores}")
        return col_scores


    # scores a board state for the max player
    def eval_fun(self, gamestate, create4_weight, create3_weight, create2_weight, create1_weight, block4_weight, block3_weight, block2_weight, block1_weight):
        #print("evaluating board state with weights: ")
        gamestate_score = 0

        gamestate_score += self.count_n_in_a_row(gamestate, 1, 4) * create4_weight
        gamestate_score += self.count_n_in_a_row(gamestate, 1, 3) * create3_weight
        gamestate_score += self.count_n_in_a_row(gamestate, 1, 2) * create2_weight
        gamestate_score += self.count_n_in_a_row(gamestate, 1, 1) * create1_weight

        gamestate_score -= self.count_n_in_a_row(gamestate, -1, 4) * block4_weight
        gamestate_score -= self.count_n_in_a_row(gamestate, -1, 3) * block3_weight
        gamestate_score -= self.count_n_in_a_row(gamestate, -1, 2) * block2_weight
        gamestate_score -= self.count_n_in_a_row(gamestate, -1, 1) * block1_weight
        

        return gamestate_score
    
    def count_n_in_a_row(self, gamestate, player, n):
        count = 0

        directions = [
            (0, 1),   # horizontal 
            (1, 0),   # vertical 
            (1, 1),   # diagonal 
            (1, -1)   # diagonal 
        ]

        for row in range(self.ROWS):
            for col in range(self.COLS):

                if gamestate[row][col] != player:
                    continue

                for dr, dc in directions:
                    end_row = row + (n - 1) * dr
                    end_col = col + (n - 1) * dc

                    # Stay inside board
                    if not (0 <= end_row < self.ROWS and 0 <= end_col < self.COLS):
                        continue

                    # Check exactly n in a row
                    sequence = True
                    for i in range(n):
                        r = row + i * dr
                        c = col + i * dc
                        if gamestate[r][c] != player:
                            sequence = False
                            break

                    if not sequence:
                        continue

                    # Check that it's NOT part of longer chain
                    before_r = row - dr
                    before_c = col - dc
                    after_r = end_row + dr
                    after_c = end_col + dc

                    before_valid = (
                        0 <= before_r < self.ROWS and
                        0 <= before_c < self.COLS and
                        gamestate[before_r][before_c] == player
                    )

                    after_valid = (
                        0 <= after_r < self.ROWS and
                        0 <= after_c < self.COLS and
                        gamestate[after_r][after_c] == player
                    )

                    if not before_valid and not after_valid:
                        count += 1

        return count
            
        


    # return list of possible game positions you can ply
    def get_moves(self, gamestate):
        #print("getting moves")
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






