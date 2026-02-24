from backend.app.games.game import Game


class Connect4(Game):
    ROWS = 6
    COLS = 7

    def __init__(self):
        self.gamestate = [[0] * self.COLS for _ in range(self.ROWS)]
        self.currentTurn = 1

    def print_game_state(self):
        for row in self.gamestate:
            print(row)

    def reset(self):
        self.gamestate = [[0] * self.COLS for _ in range(self.ROWS)]
        self.currentTurn = 1

    def play_turn(self, column):
        column = max(0, min(self.COLS - 1, column))
        if self.gamestate[0][column] != 0:
            return -1, column

        board = self.gamestate
        player = self.currentTurn

        for row in range(self.ROWS - 1, -1, -1):
            if board[row][column] == 0:
                board[row][column] = player
                if self.check_winner(row, column, player):
                    return "win", player
                if self.check_tie(self.gamestate):
                    return "tie", 0
                self.currentTurn = -player
                return row, column

        return 0, 0
    def check_tie(self, gamestate):
        return all(gamestate[i][j] != 0 for i in range(self.ROWS) for j in range(self.COLS))

    def check_winner(self, row, col, player):
        board = self.gamestate

        for dr, dc in ((0, 1), (1, 0), (1, 1), (1, -1)):
            total = 1

            r, c = row + dr, col + dc
            while 0 <= r < self.ROWS and 0 <= c < self.COLS and board[r][c] == player:
                total += 1
                r += dr
                c += dc

            r, c = row - dr, col - dc
            while 0 <= r < self.ROWS and 0 <= c < self.COLS and board[r][c] == player:
                total += 1
                r -= dr
                c -= dc

            if total >= 4:
                return True

        return False


# x = Connect4()
# while True:
#     y = int(input())
#     result = x.drop_tile(y)
#
#     if result and result[0] == "win":
#         print(f"player {result[1]} wins")
#         x.reset_board()
#
#     x.print_game_state()
