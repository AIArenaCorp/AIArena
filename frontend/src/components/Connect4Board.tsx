import { useEffect, useState } from "react";
import { getBoard, makeMove, resetGame } from "../api/connect4";
import { getDummyMove, updateAiWeights } from "../api/c4_dummy_agent";

export default function Connect4Board() {
  const [board, setBoard] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [weights, setWeights] = useState({
      create4: 0,
      create3: 0,
      create2: 0,
      create1: 0,
      block3: 0,
      block2: 0,
      block1: 0
    });
  useEffect(() => {
    updateAiWeights(weights).catch(err => console.error("Weight sync failed", err));
  }, [weights]);

  const totalPoints = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = 100 - totalPoints;
  useEffect(() => {
    loadBoard();
  }, []);


  async function runSimulationStep() {
    if (timeLeft <= 0 || winner || isLoading) return;

    try {
      const recommendedColumn = await getDummyMove(board);

      if (recommendedColumn !== -1) {
        const data = await makeMove(recommendedColumn);

        if (data.result) {
          setTimeout(() => handleReset(), 1000);
        } else {
          setBoard(data.board ?? data);
        }
      }
    } catch (error) {
      console.error("AI Move failed", error);
    }
  }
  async function handleFinalizeAI() {
    console.log("Time is up! AI personality is locked.");
    handleReset();
  }
  const handleWeightChange = (key: string, newValue: string) => {
  const numValue = Math.max(0, parseInt(newValue) || 0); // No negatives

  const otherWeightsTotal = Object.entries(weights)
    .filter(([k]) => k !== key)
    .reduce((sum, [_, val]) => sum + val, 0);

  if (otherWeightsTotal + numValue <= 100) {
    setWeights(prev => ({
      ...prev,
      [key]: numValue,
    }));
   }
  };



    const [isSimulating, setIsSimulating] = useState(true);

    useEffect(() => {
      let timer: NodeJS.Timeout;

      if (isSimulating && !winner && !isLoading) {
        timer = setTimeout(() => {
          runSimulationStep();
        }, 500);
      }

      return () => clearTimeout(timer);
    }, [board, isSimulating, winner, isLoading]);

    async function runSimulationStep() {
      const recommendedColumn = await getDummyMove(board);

      const data = await makeMove(recommendedColumn);

      if (data.result[0] == "win") {
          setBoard(data.board);
          setWinner(data.result[1]);
          setTimeout(() => handleReset(), 1000);
      } else {
        setBoard(data.board);
      }
    }


    const [timeLeft, setTimeLeft] = useState(90);

    useEffect(() => {
      if (timeLeft > 0) {
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
      } else {
        setIsSimulating(false);
        handleFinalizeAI();
      }
    }, [timeLeft]);



  async function loadBoard() {
    const data = await getBoard();
    setBoard(data.board ?? data);
  }

  async function handleClick(col: number) {
    if (isLoading || winner) return;
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
    <div style={{ display: "flex", justifyContent: "center", gap: "40px", padding: "20px" }}>
      <div style={{ padding: '10px', background: remaining < 0 ? '#ffcccc' : '#f0f0f0' }}>
          <h2>Time Remaining: {timeLeft}s</h2>

          <h3>AI Personality</h3>
          <p>Points Remaining: <strong>{remaining}</strong></p>

          {Object.entries(weights).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
              <input
                type="text"
                value={val}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                style={{ width: '60px' }}
              />
            </div>
          ))}
        <button onClick={handleReset}>Reset Game</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {winner && <h2 style={{ color: winner === 1 ? "red" : "gold" }}>Player {winner === 1 ? "red" : "yellow" } wins!</h2>}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board[0]?.length || 7}, 60px)`,
          gap: 5,
          backgroundColor: "#0033cc",
          padding: "10px",
          borderRadius: "8px"
        }}>
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                onClick={() => handleClick(cIdx)}
                style={{
                  width: 60, height: 60, borderRadius: "50%",
                  backgroundColor: cell === 1 ? "red" : cell === -1 ? "yellow" : "white",
                  cursor: winner ? "default" : "pointer",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}