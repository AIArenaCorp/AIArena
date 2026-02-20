import { useEffect, useState } from "react";
import { getBoard, makeMove, resetGame } from "../api/connect4";
import { getDummyMove, updateDummyAIWeights } from "../api/c4_dummy_agent";
import { getMinimaxColScores, updateMinimaxWeights } from "../api/c4_minimax_agent";

// add a block 4 column, instead of 2 dummys i should be the mini max agent, 
export default function Connect4Board() {
  const [board, setBoard] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<"PLAYER_VS_AI" | "AI_VS_DUMMY">("PLAYER_VS_AI");
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState({
      depth: 1,
      create4: 1,
      create3: 1,
      create2: 1,
      create1: 1,
      block4: 1,
      block3: 1,
      block2: 1,
      block1: 1
    });


  useEffect(() => {
    Promise.all([
      updateDummyAIWeights(weights),
      updateMinimaxWeights(weights)
    ]).catch(err => console.error("Weight sync failed", err));
  }, [weights]);

  useEffect(() => { loadBoard(); }, []);

  const totalPoints = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = 300 - totalPoints;

 // gets best move from minimax 
  function getBestMove(scoresMap: Record<string, number>) {
    let bestCol = -1;
    let bestScore = -Infinity;

    // Object.entries gives us pairs of [columnNumber, score]
    Object.entries(scoresMap).forEach(([col, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestCol = parseInt(col); // Convert the string key "3" to number 3
      }
    });

    // If the map was empty (no moves), default to a safe value or handle appropriately
    return bestCol !== -1 ? bestCol : 0;
  }

  async function handleFinalizeAI() {
    console.log("Time is up! AI personality is locked.");
    setGameMode("PLAYER_VS_AI");
    handleReset();
  }
  const handleWeightChange = (key: string, newValue: string) => {
  const numValue = Math.max(0, parseInt(newValue) || 0); // No negatives

  const otherWeightsTotal = Object.entries(weights)
    .filter(([k]) => k !== key)
    .reduce((sum, [_, val]) => sum + val, 0);

  if (otherWeightsTotal + numValue <= 300) {
    setWeights(prev => ({
      ...prev,
      [key]: numValue,
    }));
   }
  };



    const [isSimulating, setIsSimulating] = useState(true);

    useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;

      if (gameMode == "AI_VS_DUMMY" && !winner && !isLoading && board.length > 0) {
        const timer = setTimeout(async () => {
          setIsLoading(true);

          // get turn by counting pieces
          const flat = board.flat();
          const redCount = flat.filter(x => x === 1).length;
          const yellowCount = flat.filter(x => x === -1).length;

          const isMinimaxTurn = redCount === yellowCount;

          let col;
          
          if (isMinimaxTurn) {
              const scoresMap = await getMinimaxColScores(board);
              setCurrentScores(scoresMap);
              col = getBestMove(scoresMap);
          } else {
              col = await getDummyMove(board);
          }

        const data = await makeMove(col);

        if (data.result?.[0] === "win") {
          setBoard(data.board);
          setWinner(data.result[1]);
        } else {
          setBoard(data.board);
        }

        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    }, [board, isSimulating, winner, isLoading, gameMode]);

    

    // Timer only runs in AI vs AI
    useEffect(() => {
      if (gameMode !== "AI_VS_DUMMY") {
        setIsSimulating(false);
        
      }else {
        setIsSimulating(true);
      }
      }, [gameMode]);

    async function runSimulationStep() {
      if (winner || isLoading) return;

      const recommendedColumn = await getDummyMove(board);
      const data = await makeMove(recommendedColumn);

      if (data.result[0] == "win") {
        setBoard(data.board);
        setWinner(data.result[1]);
        setIsSimulating(false);
      } else {
        setBoard(data.board);
      }
    }


    const [timeLeft, setTimeLeft] = useState(90);

    useEffect(() => {
      if (timeLeft > 0) {
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
      } else if (timeLeft === 0) { // Only run when it hits exactly 0
        setIsSimulating(false);
        handleFinalizeAI();
      }
    }, [timeLeft]);



  async function loadBoard() {
    const data = await getBoard();
    setBoard(data.board ?? data);
  }

  async function handleClick(col: number) {
    if (isLoading || winner || gameMode !== "PLAYER_VS_AI") return;
  
    setIsLoading(true);

    const data = await makeMove(col);
    setBoard(data.board ?? data);

    if (data.result?.[0] === "win") {
      setWinner(data.result[1]);
      setIsLoading(false);
    } else {
      // Minimax move
      const scoresMap = await getMinimaxColScores(data.board);
      setCurrentScores(scoresMap);
      const bestCol = getBestMove(scoresMap);

      const aiData = await makeMove(bestCol);

      if (aiData.result?.[0] === "win") {
        setBoard(aiData.board);
        setWinner(aiData.result[1]);
      } else {
        setBoard(aiData.board);
      }

      setIsLoading(false);
    }
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

        <h3>Game Mode</h3>
        <button
          onClick={() => setGameMode("PLAYER_VS_AI")}
          disabled={gameMode === "PLAYER_VS_AI"}
        >
          Player vs Dummy AI
        </button>

        <button
          onClick={() => setGameMode("AI_VS_DUMMY")}
          disabled={gameMode === "AI_VS_DUMMY"}
          style={{ marginLeft: "10px" }}
        >
          Dummy AI vs Dummy AI
        </button>

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
      
      {/* Column Scores Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board[0]?.length || 7}, 60px)`,
        gap: 5,
        marginBottom: "10px",
        textAlign: "center",
        fontWeight: "bold",
        fontFamily: "monospace",
        color: "#444"
      }}>
        {Array.from({ length: board[0]?.length || 7 }).map((_, i) => (
          <div key={`score-${i}`}>
            {currentScores[i] !== undefined ? currentScores[i].toFixed(1) : "-"}
          </div>
        ))}
      </div>

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