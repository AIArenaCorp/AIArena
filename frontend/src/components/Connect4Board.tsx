import { useEffect, useState } from "react";
import { getBoard, makeMove, resetGame } from "../api/connect4";

export default function Connect4Board() {
  const [board, setBoard] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    const data = await getBoard();
    setBoard(data.board ?? data);
  }

  async function handleClick(col: number) {
    if (isLoading || winner) return; // prevent clicks after win
    setIsLoading(true);
    const data = await makeMove(col);
    console.log(data)

    if ("result" in data && data.result[0] === "win") {
      setBoard(data.board ?? data);
      setWinner(data.result[1]);
    } else {
      setBoard(data.board ?? data);
    }

    setIsLoading(false);
  }

  async function handleReset() {
    setIsLoading(true);
    const data = await resetGame();
    setBoard(data.board ?? data);
    setWinner(null);
    setIsLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button onClick={handleReset} style={{ marginBottom: 20 }}>Reset</button>
      {winner && (
        <h2 style={{ color: winner === 1 ? "red" : "yellow" }}>
          Player {winner === 1 ? "Red" : "Yellow"} wins!
        </h2>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board[0]?.length || 7}, 60px)`,
        gap: 5
      }}>
        {board.length > 0 && board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              onClick={() => handleClick(cIdx)}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor:
                  cell === 1 ? "red" :
                  cell === -1 ? "yellow" :
                  "white",
                border: "2px solid black",
                cursor: winner ? "default" : "pointer",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
