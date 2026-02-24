import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getBoard, makeMove, resetGame } from "../api/connect4";
import { getMinimaxColScores, updateMinimaxWeights } from "../api/c4_minimax_agent";

// ── Reuse exact same theme tokens as Connect4Board ──────────────────────────

const getDarkStyles = () => `
  .ch-root {
    --bg: #0a0a12;
    --panel-bg: #0f0f1e;
    --panel-border: #1e1e3a;
    --accent-red: #ff2244;
    --accent-yellow: #ffd600;
    --accent-blue: #1a3fff;
    --board-bg: #0a1aff;
    --text-primary: #e8e8ff;
    --text-muted: #6666aa;
    --glow-red: 0 0 20px #ff224488, 0 0 40px #ff224444;
    --glow-yellow: 0 0 20px #ffd60088, 0 0 40px #ffd60044;
    --glow-blue: 0 0 20px #1a3fff88;
    --neon-green: #00ff88;
    --input-bg: #0a0a1a;
    --shadow-panel: 0 4px 40px #00000088;
    --shadow-board: 0 0 0 3px #0011cc, 0 8px 60px #0a1aff88, 0 0 80px #0a1aff44, inset 0 2px 0 #4466ff44;
    --cell-empty: radial-gradient(circle at 35% 35%, #1a1a2e, #08080f);
    --cell-empty-hover: radial-gradient(circle at 35% 35%, #1a1a3e, #101020);
    --cell-empty-inset: inset 0 3px 8px #00000088, inset 0 -1px 3px #ffffff08;
    --topbar-bg: #0f0f1e;
    --topbar-border: #1e1e3a;
    --score-bg: #0f0f1e;
  }
  .ch-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 50%, #0a1aff18 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, #ff224412 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const getLightStyles = () => `
  .ch-root {
    --bg: #eef1fa;
    --panel-bg: #ffffff;
    --panel-border: #dde1f0;
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
    --shadow-panel: 0 2px 20px #00000014, 0 1px 3px #00000008;
    --shadow-board: 0 0 0 3px #1833bb, 0 8px 40px #2244dd44, inset 0 2px 0 #ffffff33;
    --cell-empty: radial-gradient(circle at 35% 35%, #dde3f5, #c8d2ec);
    --cell-empty-hover: radial-gradient(circle at 35% 35%, #cdd5f0, #b8c8e8);
    --cell-empty-inset: inset 0 3px 8px #00000018, inset 0 -1px 3px #ffffff88;
    --topbar-bg: #ffffff;
    --topbar-border: #dde1f0;
    --score-bg: #f5f7fd;
  }
  .ch-root::before {
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

  .ch-root {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text-primary);
    display: grid;
    grid-template-columns: minmax(0, 300px) 1fr minmax(0, 300px);
    grid-template-rows: 56px 1fr;
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  /* ── Topbar ── */
  .ch-topbar {
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

  .ch-topbar-left { display: flex; align-items: center; gap: 20px; }
  .ch-topbar-right { display: flex; align-items: center; gap: 14px; }

  .ch-topbar-home {
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

  .ch-topbar-home:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
    box-shadow: var(--glow-blue);
  }

  .ch-topbar-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 4px;
    color: var(--accent-blue);
    text-shadow: var(--glow-blue);
  }

  .ch-topbar-btn {
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

  .ch-topbar-btn:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
    box-shadow: var(--glow-blue);
  }

  .ch-theme-toggle {
    width: 52px;
    height: 28px;
    border-radius: 14px;
    border: 1px solid var(--panel-border);
    background: var(--panel-bg);
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
    padding: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .ch-theme-toggle:hover {
    border-color: var(--accent-blue);
    box-shadow: var(--glow-blue);
  }

  .ch-theme-knob {
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent-blue);
    top: 2px;
    transition: transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }

  .ch-theme-knob.is-dark  { transform: translateX(3px); }
  .ch-theme-knob.is-light { transform: translateX(27px); }

  /* ── Side panels ── */
  .ch-left-panel, .ch-right-panel {
    padding: 20px 16px;
    border-right: 1px solid var(--panel-border);
    overflow-y: auto;
    max-height: calc(100vh - 56px);
    position: sticky;
    top: 56px;
    align-self: start;
    background: var(--bg);
    transition: border-color 0.3s;
  }

  .ch-right-panel { border-right: none; border-left: 1px solid var(--panel-border); }

  .ch-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 18px;
    position: relative;
    box-shadow: var(--shadow-panel);
    margin-bottom: 14px;
    transition: background 0.3s, border-color 0.3s;
  }

  .ch-panel:last-child { margin-bottom: 0; }

  .ch-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
    border-radius: 10px 10px 0 0;
  }

  .ch-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--panel-border);
  }

  /* ── Opponent card ── */
  .ch-opponent-icon {
    font-size: 32px;
    text-align: center;
    margin-bottom: 10px;
  }

  .ch-opponent-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--accent-blue);
    text-shadow: var(--glow-blue);
    text-align: center;
    margin-bottom: 4px;
  }

  .ch-opponent-creator {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .ch-elo-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--input-bg);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 10px;
  }

  .ch-elo-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: var(--neon-green);
    text-shadow: 0 0 10px var(--neon-green);
  }

  .ch-elo-label {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  /* ── Stat rows ── */
  .ch-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--panel-border);
    transition: border-color 0.3s;
  }

  .ch-stat-row:last-child { border-bottom: none; }

  .ch-stat-label {
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .ch-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .ch-stat-value.red    { color: var(--accent-red); }
  .ch-stat-value.yellow { color: var(--accent-yellow); }
  .ch-stat-value.green  { color: var(--neon-green); }

  /* ── Buttons ── */
  .ch-btn {
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

  .ch-btn:hover:not(:disabled) {
    border-color: var(--accent-blue);
    color: var(--text-primary);
    background: var(--input-bg);
  }

  .ch-btn.danger { color: var(--accent-red); }
  .ch-btn.danger:hover { border-color: var(--accent-red); box-shadow: var(--glow-red); }

  /* ── Loading dots ── */
  .ch-loading-dots { display: flex; gap: 5px; align-items: center; }

  .ch-loading-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent-blue);
    box-shadow: var(--glow-blue);
    animation: chBlink 1s infinite;
  }

  .ch-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .ch-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes chBlink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%           { opacity: 1;   transform: scale(1); }
  }

  /* ── Center board area ── */
  .ch-center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 28px 20px;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  .ch-winner-banner {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-align: center;
    padding: 10px 28px;
    border-radius: 8px;
    animation: chSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes chSlideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  .ch-winner-banner.red {
    color: var(--accent-red);
    text-shadow: var(--glow-red);
    border: 1px solid var(--accent-red);
    background: var(--input-bg);
  }

  .ch-winner-banner.yellow {
    color: var(--accent-yellow);
    text-shadow: var(--glow-yellow);
    border: 1px solid var(--accent-yellow);
    background: var(--input-bg);
  }

  /* ── Board ── */
  .ch-board-wrap {
    background: var(--board-bg);
    padding: 12px;
    border-radius: 14px;
    box-shadow: var(--shadow-board);
    transition: box-shadow 0.3s;
  }

  .ch-board-grid { display: grid; gap: 6px; }

  .ch-cell {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .ch-cell.empty {
    background: var(--cell-empty);
    box-shadow: var(--cell-empty-inset);
  }

  .ch-cell.red-piece {
    background: radial-gradient(circle at 35% 30%, #ff7788, var(--accent-red) 60%, #880011);
    box-shadow: var(--glow-red), inset 0 -3px 8px #88001122;
    animation: chDropIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  .ch-cell.yellow-piece {
    background: radial-gradient(circle at 35% 30%, #ffee88, var(--accent-yellow) 60%, #886600);
    box-shadow: var(--glow-yellow), inset 0 -3px 8px #88660022;
    animation: chDropIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  @keyframes chDropIn {
    from { transform: scale(0.7); opacity: 0.5; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .ch-cell.empty:hover { background: var(--cell-empty-hover); transform: scale(1.04); }

  /* ── Vs badge ── */
  .ch-vs-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    box-shadow: var(--shadow-panel);
  }

  .ch-vs-player {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .ch-vs-player.red    { color: var(--accent-red); }
  .ch-vs-player.yellow { color: var(--accent-yellow); }

  .ch-vs-sep {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 2px;
  }

  /* ── No-bot fallback ── */
  .ch-no-bot {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    min-height: calc(100vh - 56px);
    font-family: 'Orbitron', sans-serif;
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    position: relative;
    z-index: 1;
  }

  .ch-no-bot-icon { font-size: 40px; opacity: 0.4; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .ch-root { grid-template-columns: 1fr; grid-template-rows: auto; }
    .ch-left-panel, .ch-right-panel { position: static; max-height: none; border: none; border-bottom: 1px solid var(--panel-border); }
    .ch-topbar { position: static; }
    .ch-cell { width: 44px; height: 44px; }
    .ch-board-grid { gap: 4px; }
    .ch-board-wrap { padding: 8px; }
  }

  @media (min-width: 1400px) {
    .ch-root { grid-template-columns: minmax(0, 320px) 1fr minmax(0, 320px); }
    .ch-cell { width: 70px; height: 70px; }
    .ch-board-grid { gap: 7px; }
  }

  @media (min-width: 1700px) {
    .ch-root { grid-template-columns: minmax(0, 360px) 1fr minmax(0, 360px); }
    .ch-cell { width: 78px; height: 78px; }
    .ch-board-grid { gap: 8px; }
    .ch-board-wrap { padding: 14px; }
  }
`;

type BotWeights = {
  depth: number; create4: number; create3: number; create2: number;
  opponent4: number; opponent3: number; opponent2: number;
};
type Bot = { bot_name: string; username: string; elo: number; weights?: BotWeights; };
type Props = { isDark?: boolean; setIsDark?: (v: boolean) => void; };

export default function ChallengePage({ isDark = false, setIsDark }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const bot: Bot | undefined = location.state?.bot;

  const [board, setBoard] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [weightsReady, setWeightsReady] = useState(false);

  // Apply the bot's weights before loading the board so the minimax
  // agent is configured for this specific opponent before any move.
  useEffect(() => {
    async function init() {
      if (bot?.weights) {
        await updateMinimaxWeights(bot.weights);
      }
      setWeightsReady(true);
      await loadBoard();
    }
    init();
  }, []);

  async function loadBoard() {
    const data = await getBoard();
    setBoard(data.board ?? data);
  }

  async function handleReset() {
    setIsLoading(true);
    const data = await resetGame();
    setBoard(data.board ?? data);
    setWinner(null);
    setMoveCount(0);
    setIsLoading(false);
  }

  function getBestMove(scoresMap: Record<string, number>) {
    let bestCol = -1, bestScore = -Infinity;
    Object.entries(scoresMap).forEach(([col, score]) => {
      if (score > bestScore) { bestScore = score; bestCol = parseInt(col); }
    });
    return bestCol !== -1 ? bestCol : 0;
  }

  async function handleClick(col: number) {
    if (isLoading || winner || !weightsReady) return;
    setIsLoading(true);

    // Player move (player is red = 1)
    const data = await makeMove(col);
    setBoard(data.board ?? data);
    setMoveCount(c => c + 1);

    if (data.result?.[0] === "win") {
      setWinner(data.result[1]);
      setIsLoading(false);
      return;
    }
    if (data.result?.[0] === "win") {
      setWinner(data.result[1]);
      setIsLoading(false);
      return;
    }

    // Bot move (bot is yellow = -1), uses bot's saved weights via minimax
    const scoresMap = await getMinimaxColScores(data.board, -1);
    const bestCol = getBestMove(scoresMap);
    const aiData = await makeMove(bestCol);
    setMoveCount(c => c + 1);

    if (aiData.result?.[0] === "win") {
      setBoard(aiData.board);
      setWinner(aiData.result[1]);
    } else {
      setBoard(aiData.board);
    }

    setIsLoading(false);
  }

  const flat = board.flat();
  const redPieces = flat.filter(x => x === 1).length;
  const yellowPieces = flat.filter(x => x === -1).length;
  const isPlayerTurn = redPieces === yellowPieces;
  const cols = board[0]?.length || 7;

  return (
    <>
      <style>{BASE_STYLES + (isDark ? getDarkStyles() : getLightStyles())}</style>
      <div className="ch-root">

        {/* ── Topbar ── */}
        <div className="ch-topbar">
          <div className="ch-topbar-left">
            <Link to="/" className="ch-topbar-home">← Home</Link>
            <div className="ch-topbar-title">CHALLENGE</div>
          </div>
          <div className="ch-topbar-right">
            {isLoading && <div className="ch-loading-dots"><span /><span /><span /></div>}
            {setIsDark && (
              <button
                className="ch-theme-toggle"
                onClick={() => setIsDark(!isDark)}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <div className={`ch-theme-knob ${isDark ? 'is-dark' : 'is-light'}`}>
                  {isDark ? '☀️' : '🌙'}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ── No bot state ── */}
        {!bot ? (
          <div className="ch-no-bot">
            <div className="ch-no-bot-icon">⚠️</div>
            No opponent selected
            <button className="ch-btn" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate("/")}>
              ← Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* ── Left Panel: Opponent info ── */}
            <div className="ch-left-panel">
              <div className="ch-panel">
                <div className="ch-section-title">Your Opponent</div>
                <div className="ch-opponent-icon">🤖</div>
                <div className="ch-opponent-name">{bot.bot_name}</div>
                <div className="ch-opponent-creator">by {bot.username}</div>
                <div className="ch-elo-badge">
                  <span className="ch-elo-value">{Math.round(bot.elo)}</span>
                  <span className="ch-elo-label">Elo Rating</span>
                </div>
              </div>

              <div className="ch-panel">
                <div className="ch-section-title">Controls</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="ch-btn danger" onClick={handleReset}>↺ Reset Game</button>
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <button className="ch-btn" style={{ width: '100%' }}>← Back to Home</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Center: Board ── */}
            <div className="ch-center-col">

              {/* Vs badge */}
              <div className="ch-vs-badge">
                <span className="ch-vs-player red">YOU</span>
                <span className="ch-vs-sep">VS</span>
                <span className="ch-vs-player yellow">{bot.bot_name}</span>
              </div>

              {winner && (
                <div className={`ch-winner-banner ${winner === 1 ? 'red' : 'yellow'}`}>
                  {winner === 1 ? '🔴 You Win!' : `🟡 ${bot.bot_name} Wins!`}
                </div>
              )}

              <div className="ch-board-wrap" onMouseLeave={() => setHoveredCol(null)}>
                <div className="ch-board-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`ch-cell ${cell === 1 ? 'red-piece' : cell === -1 ? 'yellow-piece' : 'empty'}`}
                        onClick={() => handleClick(cIdx)}
                        onMouseEnter={() => setHoveredCol(cIdx)}
                        style={{
                          cursor: winner || !isPlayerTurn || !weightsReady ? 'default' : 'pointer',
                          outline: hoveredCol === cIdx && !winner && isPlayerTurn && weightsReady && cell === 0
                            ? '2px solid rgba(255,255,255,0.25)'
                            : 'none',
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {!winner && (
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  {!weightsReady
                    ? '⏳ Loading opponent...'
                    : isPlayerTurn
                    ? '▶ Your Turn'
                    : `⏳ ${bot.bot_name} is thinking...`}
                </div>
              )}
            </div>

            {/* ── Right Panel: Match stats ── */}
            <div className="ch-right-panel">
              <div className="ch-panel">
                <div className="ch-section-title">Match Stats</div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Moves</span>
                  <span className="ch-stat-value">{moveCount}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Your pieces</span>
                  <span className="ch-stat-value red">{redPieces}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Bot pieces</span>
                  <span className="ch-stat-value yellow">{yellowPieces}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Turn</span>
                  <span className={`ch-stat-value ${winner ? '' : isPlayerTurn ? 'red' : 'yellow'}`}>
                    {winner ? '—' : isPlayerTurn ? 'You' : 'Bot'}
                  </span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Status</span>
                  <span className={`ch-stat-value ${winner === 1 ? 'red' : winner === -1 ? 'yellow' : 'green'}`}>
                    {winner === 1 ? 'You Won!' : winner === -1 ? 'Bot Won' : isLoading ? 'Thinking...' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="ch-panel">
                <div className="ch-section-title">Opponent Info</div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Bot Name</span>
                  <span className="ch-stat-value" style={{ fontSize: '10px', letterSpacing: '1px' }}>{bot.bot_name}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Creator</span>
                  <span className="ch-stat-value" style={{ fontSize: '11px' }}>{bot.username}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">Elo</span>
                  <span className="ch-stat-value green">{Math.round(bot.elo)}</span>
                </div>
                <div className="ch-stat-row">
                  <span className="ch-stat-label">AI Type</span>
                  <span className="ch-stat-value" style={{ fontSize: '10px' }}>Minimax</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}