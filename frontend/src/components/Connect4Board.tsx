import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBoard, makeMove, resetGame } from "../api/connect4";
import { getDummyMove, updateDummyAIWeights } from "../api/c4_dummy_agent";
import { getMinimaxColScores, updateMinimaxWeights, submitAIBot } from "../api/c4_minimax_agent";

const getLightStyles = () => `
  .c4-root {
    --bg: #eef1fa;
    --panel-bg: #ffffff;
    --panel-border: #dde1f0;
    --panel-border-rgb: 221,225,240;
    --accent-red: #e5112e;
    --accent-yellow: #d4a800;
    --accent-blue: #2244dd;
    --board-bg: #2244dd;
    --text-primary: #1a1a3a;
    --text-muted: #7788bb;
    --glow-red: 0 0 12px #e5112e55;
    --glow-yellow: 0 0 12px #d4a80055;
    --glow-blue: 0 0 12px #2244dd55;
    --neon-green: #007a40;
    --input-bg: #f5f7fd;
    --bar-track: #e0e4f4;
    --shadow-panel: 0 2px 20px #00000014, 0 1px 3px #00000008;
    --shadow-board: 0 0 0 3px #1833bb, 0 8px 40px #2244dd44, inset 0 2px 0 #ffffff33;
    --cell-empty: radial-gradient(circle at 35% 35%, #dde3f5, #c8d2ec);
    --cell-empty-hover: radial-gradient(circle at 35% 35%, #cdd5f0, #b8c8e8);
    --cell-empty-inset: inset 0 3px 8px #00000018, inset 0 -1px 3px #ffffff88;
    --score-bg: #f5f7fd;
    --topbar-bg: #ffffff;
    --topbar-border: #dde1f0;
  }
  .c4-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 50%, #2244dd08 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, #e5112e06 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .c4-root {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text-primary);
    display: grid;
    grid-template-columns: 260px 1fr 260px;
    grid-template-rows: 56px 1fr;
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  .c4-topbar {
    grid-column: 1 / -1;
    background: var(--topbar-bg);
    border-bottom: 1px solid var(--topbar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 56px;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 12px #00000018;
    transition: background 0.3s, border-color 0.3s;
  }

  .c4-topbar-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .c4-topbar-home {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    border: 1px solid var(--panel-border);
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .c4-topbar-home:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
    box-shadow: var(--glow-blue);
  }

  .c4-topbar-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--panel-border);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .c4-topbar-btn:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
    box-shadow: var(--glow-blue);
  }

  .c4-topbar-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 5px;
    color: var(--accent-blue);
    text-shadow: var(--glow-blue);
  }

  .c4-topbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .c4-mode-badge-top {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
    text-transform: uppercase;
    transition: all 0.3s;
  }


  .c4-left-panel, .c4-right-panel {
    padding: 20px 16px;
    border-right: 1px solid var(--panel-border);
    overflow-y: auto;
    max-height: calc(100vh - 56px);
    position: sticky;
    top: 56px;
    align-self: start;
    transition: border-color 0.3s;
    background: var(--bg);
  }

  .c4-right-panel {
    border-right: none;
    border-left: 1px solid var(--panel-border);
  }

  .c4-center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 28px 20px;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  .c4-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 18px;
    position: relative;
    box-shadow: var(--shadow-panel);
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    margin-bottom: 14px;
  }

  .c4-panel:last-child { margin-bottom: 0; }

  .c4-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
    border-radius: 10px 10px 0 0;
  }

  .c4-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--panel-border);
    transition: color 0.3s, border-color 0.3s;
  }

  .c4-timer {
    font-family: 'Orbitron', sans-serif;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: 4px;
    text-align: center;
    color: var(--neon-green);
    text-shadow: 0 0 20px var(--neon-green);
    margin-bottom: 4px;
    transition: color 0.3s;
  }

  .c4-timer.urgent {
    color: var(--accent-red) !important;
    text-shadow: var(--glow-red);
    animation: pulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 1; }
    to { opacity: 0.55; }
  }

  .c4-timer-label {
    text-align: center;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .c4-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid var(--panel-border);
    background: transparent;
    color: var(--text-muted);
    padding: 9px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .c4-btn:hover:not(:disabled) {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
  }

  .c4-btn.active {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
    background: var(--input-bg);
    box-shadow: var(--glow-blue);
  }

  .c4-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .c4-btn.danger { color: var(--accent-red); border-color: var(--panel-border); }

  .c4-btn.danger:hover:not(:disabled) {
    background: var(--input-bg);
    border-color: var(--accent-red);
    box-shadow: var(--glow-red);
  }

  .c4-btn.submit-btn {
    padding: 13px;
    font-size: 11px;
    letter-spacing: 3px;
    background: var(--neon-green);
    border: none;
    color: #001a0d;
    font-weight: 700;
    box-shadow: 0 0 20px var(--neon-green)44;
    transition: all 0.2s;
  }

  .c4-btn.submit-btn:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .c4-btn.submit-btn:disabled {
    background: var(--panel-border);
    color: var(--text-muted);
    box-shadow: none;
  }

  .c4-mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .c4-divider {
    border: none;
    border-top: 1px solid var(--panel-border);
    margin: 14px 0;
    transition: border-color 0.3s;
  }

  .weight-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .weight-label {
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--text-muted);
    text-transform: uppercase;
    flex: 1;
    transition: color 0.3s;
  }

  .weight-input {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    width: 52px;
    background: var(--input-bg);
    border: 1px solid var(--panel-border);
    color: var(--text-primary);
    padding: 4px 7px;
    border-radius: 5px;
    text-align: right;
    transition: border-color 0.2s, background 0.3s, color 0.3s;
    outline: none;
  }

  .weight-input:focus {
    border-color: var(--accent-blue);
    box-shadow: var(--glow-blue);
  }

  .points-bar-wrap {
    height: 4px;
    background: var(--bar-track);
    border-radius: 2px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: background 0.3s;
  }

  .points-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease, background 0.3s;
  }

  .points-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    text-align: right;
    margin-bottom: 8px;
    transition: color 0.3s;
  }

  .c4-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--panel-border);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: 6px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    margin-bottom: 8px;
    outline: none;
    transition: border-color 0.2s, background 0.3s, color 0.3s;
  }

  .c4-input:focus { border-color: var(--accent-blue); }
  .c4-input::placeholder { color: var(--text-muted); }

  .error-hint {
    font-size: 9px;
    color: var(--accent-red);
    letter-spacing: 1px;
    margin-top: 6px;
    text-align: center;
  }

  .c4-winner-banner {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-align: center;
    padding: 10px 28px;
    border-radius: 8px;
    animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .c4-winner-banner.red {
    color: var(--accent-red);
    text-shadow: var(--glow-red);
    border: 1px solid var(--accent-red);
    background: var(--input-bg);
  }

  .c4-winner-banner.yellow {
    color: var(--accent-yellow);
    text-shadow: var(--glow-yellow);
    border: 1px solid var(--accent-yellow);
    background: var(--input-bg);
  }

  .c4-scores-row { display: grid; gap: 5px; }

  .score-cell {
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 700;
    border-radius: 4px;
    background: var(--score-bg);
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
    letter-spacing: 0.5px;
    transition: all 0.3s;
  }

  .score-cell.best {
    color: var(--neon-green);
    border-color: var(--neon-green);
    background: var(--input-bg);
    box-shadow: 0 0 8px var(--neon-green)44;
  }

  .c4-board-wrap {
    background: var(--board-bg);
    padding: 12px;
    border-radius: 14px;
    box-shadow: var(--shadow-board);
    transition: box-shadow 0.3s;
  }

  .c4-board-grid { display: grid; gap: 6px; }

  .c4-cell {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .c4-cell.empty {
    background: var(--cell-empty);
    box-shadow: var(--cell-empty-inset);
  }

  .c4-cell.red-piece {
    background: radial-gradient(circle at 35% 30%, #ff7788, var(--accent-red) 60%, #880011);
    box-shadow: var(--glow-red), inset 0 -3px 8px #88001122;
    animation: dropIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  .c4-cell.yellow-piece {
    background: radial-gradient(circle at 35% 30%, #ffee88, var(--accent-yellow) 60%, #886600);
    box-shadow: var(--glow-yellow), inset 0 -3px 8px #88660022;
    animation: dropIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  @keyframes dropIn {
    from { transform: scale(0.7); opacity: 0.5; }
    to { transform: scale(1); opacity: 1; }
  }

  .c4-cell.empty:hover { background: var(--cell-empty-hover); transform: scale(1.04); }

  .c4-status-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .c4-loading-dots { display: flex; gap: 5px; align-items: center; }

  .c4-loading-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-blue);
    box-shadow: var(--glow-blue);
    animation: blink 1s infinite;
  }

  .c4-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .c4-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--panel-border);
    transition: border-color 0.3s;
  }

  .stat-row:last-child { border-bottom: none; }

  .stat-label {
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: color 0.3s;
  }

  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
    transition: color 0.3s;
  }

  .stat-value.red { color: var(--accent-red); }
  .stat-value.yellow { color: var(--accent-yellow); }
  .stat-value.green { color: var(--neon-green); }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .c4-root {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }
    .c4-left-panel, .c4-right-panel {
      position: static;
      max-height: none;
      border: none;
      border-bottom: 1px solid var(--panel-border);
    }
    .c4-topbar { position: static; }
    .c4-cell { width: 44px; height: 44px; }
    .c4-board-grid { gap: 4px; }
    .c4-board-wrap { padding: 8px; }
  }

  @media (min-width: 1200px) {
    .c4-root { grid-template-columns: 280px 1fr 280px; }
  }

  @media (min-width: 1400px) {
    .c4-root { grid-template-columns: 300px 1fr 300px; }
    .c4-cell { width: 70px; height: 70px; }
    .c4-board-grid { gap: 7px; }
  }

  @media (min-width: 1700px) {
    .c4-root { grid-template-columns: 340px 1fr 340px; }
    .c4-cell { width: 78px; height: 78px; }
    .c4-board-grid { gap: 8px; }
    .c4-board-wrap { padding: 14px; }
  }
`;

export default function Connect4Board() {
  const [board, setBoard] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<"PLAYER_VS_AI" | "AI_VS_DUMMY">("PLAYER_VS_AI");
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  const [botName, setBotName] = useState("MyBot");
  const [username, setUsername] = useState("User");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [lastAIMove, setLastAIMove] = useState<number | null>(null);
  const [weights, setWeights] = useState({
    depth: 1, create4: 1, create3: 1, create2: 1,
    opponent4: 1, opponent3: 1, opponent2: 1,
  });
  const [isSimulating, setIsSimulating] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    Promise.all([updateDummyAIWeights(weights), updateMinimaxWeights(weights)])
      .catch(err => console.error("Weight sync failed", err));
  }, [weights]);

  useEffect(() => { loadBoard(); }, []);

  const totalPoints = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = 300 - totalPoints;

  function getBestMove(scoresMap: Record<string, number>) {
    let bestScore = -Infinity;
    let bestCols: number[] = [];

    Object.entries(scoresMap).forEach(([col, score]) => {
        const colNum = parseInt(col);

        if (score > bestScore) {
          bestScore = score;
          bestCols = [colNum]; // reset with new best
        } else if (score === bestScore) {
          bestCols.push(colNum); // tie → add to list
        }
      });

      if (bestCols.length === 0) return 0;

      const randomIndex = Math.floor(Math.random() * bestCols.length);
      return bestCols[randomIndex];
  }

  function getBestColIndex(scoresMap: Record<string, number>) {
    let bestCol = -1, bestScore = -Infinity;
    Object.entries(scoresMap).forEach(([col, score]) => {
      if (score > bestScore) { bestScore = score; bestCol = parseInt(col); }
    });
    return bestCol;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await submitAIBot(username, botName, weights);
      alert(result.status);
    } catch (err) {
      console.error(err);
      alert("Failed to submit bot.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalizeAI() {
    setGameMode("PLAYER_VS_AI");
    handleReset();
  }

  const handleWeightChange = (key: string, newValue: string) => {
    const numValue = Math.max(0, parseInt(newValue) || 0);
    const otherWeightsTotal = Object.entries(weights)
      .filter(([k]) => k !== key).reduce((sum, [_, val]) => sum + val, 0);
    if (otherWeightsTotal + numValue <= 300) {
      setWeights(prev => ({ ...prev, [key]: numValue }));
    }
  };

  useEffect(() => {
    if (gameMode === "AI_VS_DUMMY" && !winner && !isLoading && board.length > 0) {
      const timer = setTimeout(async () => {
        setIsLoading(true);
        const flat = board.flat();
        const redCount = flat.filter(x => x === 1).length;
        const yellowCount = flat.filter(x => x === -1).length;
        const isMinimaxTurn = redCount === yellowCount;
        let col;
        if (isMinimaxTurn) {
          const scoresMap = await getMinimaxColScores(board, 1);
          setCurrentScores(scoresMap);
          col = getBestMove(scoresMap);   // choose ONCE
          setLastAIMove(col);      
        } else {
          col = await getDummyMove(board);
          setLastAIMove(col);
        }
        const data = await makeMove(col);
        if (data.result?.[0] === "win") {
          setBoard(data.board);
          setWinner(data.result[1]);
        } else {
          setBoard(data.board);
          setMoveCount(c => c + 1);
        }
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [board, isSimulating, winner, isLoading, gameMode]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
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
    setMoveCount(c => c + 1);
    if (data.result?.[0] === "win") {
      setWinner(data.result[1]);
      setIsLoading(false);
    } else {
      const scoresMap = await getMinimaxColScores(data.board, -1);
      setCurrentScores(scoresMap);
      const bestCol = getBestMove(scoresMap);
      const aiData = await makeMove(bestCol);
      setLastAIMove(bestCol);
      setMoveCount(c => c + 1);
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
    setCurrentScores({});
    setMoveCount(0);
    setIsLoading(false);
  }

  const barPercent = Math.min((totalPoints / 300) * 100, 100);
  const barColor = remaining < 0 ? 'var(--accent-red)' : remaining === 0 ? 'var(--neon-green)' : 'var(--accent-blue)';
  const bestCol = lastAIMove ?? -1;
  const cols = board[0]?.length || 7;

  const flat = board.flat();
  const redPieces = flat.filter(x => x === 1).length;
  const yellowPieces = flat.filter(x => x === -1).length;
  const isRedTurn = redPieces === yellowPieces;

  return (
    <>
      <style>{BASE_STYLES + getLightStyles()}</style>
      <div className="c4-root">

        {/* ─── Top Bar ─── */}
        <div className="c4-topbar">
          <div className="c4-topbar-left">
            <Link to="/" className="c4-topbar-home" title="Back to home">
              ← Home
            </Link>
            <div className="c4-topbar-title">CONNECT FOUR</div>
          </div>
          <div className="c4-topbar-right">
            <span className="c4-mode-badge-top">
              {gameMode === "PLAYER_VS_AI" ? "Player vs AI" : "AI vs Dummy"}
            </span>
            {isLoading && (
              <div className="c4-loading-dots"><span /><span /><span /></div>
            )}
            <button
              className="c4-topbar-btn"
              onClick={() => alert("Leaderboard coming soon!")}
              title="Toggle leaderboard"
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        {/* ─── Left Panel ─── */}
        <div className="c4-left-panel">
          <div className="c4-panel">
            <div className={`c4-timer ${timeLeft <= 30 ? 'urgent' : ''}`}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <div className="c4-timer-label">Time Remaining</div>
          </div>

          <div className="c4-panel">
            <div className="c4-section-title">Game Mode</div>
            <div className="c4-mode-buttons">
              <button
                className={`c4-btn ${gameMode === "PLAYER_VS_AI" ? "active" : ""}`}
                onClick={() => { setGameMode("PLAYER_VS_AI"); handleReset(); }}
              >Player vs AI</button>
              <button
                className={`c4-btn ${gameMode === "AI_VS_DUMMY" ? "active" : ""}`}
                onClick={() => { setGameMode("AI_VS_DUMMY"); handleReset(); }}
              >AI vs Dummy</button>
              <button className="c4-btn danger" onClick={handleReset}>↺ Reset</button>
            </div>
          </div>

          <div className="c4-panel">
            <div className="c4-section-title">AI Personality</div>
            <div className="points-label" style={{
              color: remaining < 0 ? 'var(--accent-red)' : remaining === 0 ? 'var(--neon-green)' : 'var(--text-muted)'
            }}>
              {remaining === 0 ? '✓ FULLY ALLOCATED' : `${remaining} pts remaining`}
            </div>
            <div className="points-bar-wrap">
              <div className="points-bar" style={{ width: `${barPercent}%`, background: barColor }} />
            </div>
            {Object.entries(weights).map(([key, val]) => (
              <div className="weight-row" key={key}>
                <span className="weight-label">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  className="weight-input"
                  type="text"
                  value={val}
                  onChange={(e) => handleWeightChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="c4-panel">
            <div className="c4-section-title">Leaderboard</div>
            <input className="c4-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="c4-input" placeholder="Bot Name" value={botName} onChange={e => setBotName(e.target.value)} />
            <button
              className="c4-btn submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || remaining !== 0}
            >
              {isSubmitting ? "Submitting..." : "⚡ Enter Arena"}
            </button>
            {remaining !== 0 && <p className="error-hint">Spend exactly 300 points to submit</p>}
          </div>
        </div>

        {/* ─── Center Board ─── */}
        <div className="c4-center-col">
          {winner && (
            <div className={`c4-winner-banner ${winner === 1 ? 'red' : 'yellow'}`}>
              {winner === 1 ? '🔴 Red Wins!' : '🟡 Yellow Wins!'}
            </div>
          )}

          {Object.keys(currentScores).length > 0 && (
            <div className="c4-scores-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, i) => (
                <div key={`sc-${i}`} className={`score-cell ${i === bestCol ? 'best' : ''}`}>
                  {currentScores[i] !== undefined ? currentScores[i].toFixed(1) : '—'}
                </div>
              ))}
            </div>
          )}

          <div className="c4-board-wrap" onMouseLeave={() => setHoveredCol(null)}>
            <div className="c4-board-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`c4-cell ${cell === 1 ? 'red-piece' : cell === -1 ? 'yellow-piece' : 'empty'}`}
                    onClick={() => handleClick(cIdx)}
                    onMouseEnter={() => setHoveredCol(cIdx)}
                    style={{
                      cursor: winner || gameMode !== "PLAYER_VS_AI" ? 'default' : 'pointer',
                      outline: hoveredCol === cIdx && !winner && gameMode === "PLAYER_VS_AI" && cell === 0
                        ? '2px solid rgba(255,255,255,0.25)'
                        : 'none',
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Right Panel: Stats ─── */}
        <div className="c4-right-panel">
          <div className="c4-panel">
            <div className="c4-section-title">Match Stats</div>
            <div className="stat-row">
              <span className="stat-label">Moves</span>
              <span className="stat-value">{moveCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Red Pieces</span>
              <span className="stat-value red">{redPieces}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Yellow Pieces</span>
              <span className="stat-value yellow">{yellowPieces}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Turn</span>
              <span className={`stat-value ${winner ? '' : isRedTurn ? 'red' : 'yellow'}`}>
                {winner ? '—' : isRedTurn ? 'Red' : 'Yellow'}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Status</span>
              <span className={`stat-value ${winner ? (winner === 1 ? 'red' : 'yellow') : 'green'}`}>
                {winner ? (winner === 1 ? 'Red Won' : 'Yellow Won') : isLoading ? 'Thinking...' : 'Active'}
              </span>
            </div>
          </div>

          {Object.keys(currentScores).length > 0 && (
            <div className="c4-panel">
              <div className="c4-section-title">Column Scores</div>
              {Array.from({ length: cols }).map((_, i) => {
                const score = currentScores[i];
                const isBest = i === bestCol;
                return (
                  <div className="stat-row" key={`cs-${i}`}>
                    <span className="stat-label">Col {i + 1}</span>
                    <span className="stat-value" style={{
                      color: isBest ? 'var(--neon-green)' : 'var(--text-primary)',
                      fontSize: '11px'
                    }}>
                      {score !== undefined ? score.toFixed(2) : '—'}{isBest ? ' ★' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="c4-panel">
            <div className="c4-section-title">Weight Summary</div>
            {Object.entries(weights).map(([key, val]) => (
              <div className="stat-row" key={`ws-${key}`}>
                <span className="stat-label">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="stat-value" style={{ fontSize: '11px' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}