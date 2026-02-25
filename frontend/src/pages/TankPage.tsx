import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTanksSocket } from "../hooks/useTanksSocket";
import { useTankInput } from "../hooks/useTankInput";
import TankCanvas from "../components/TankCanvas";
import { resetTankSession } from "../api/tanks";

// ── Static base styles — defined once at module level, never regenerated ────
const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .tk-root {
    font-family: 'Rajdhani', sans-serif;
    background: var(--tk-bg);
    min-height: 100vh;
    color: var(--tk-text);
    display: grid;
    grid-template-columns: 260px 1fr 260px;
    grid-template-rows: 56px 1fr;
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  .tk-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 50%, var(--tk-radial1) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, var(--tk-radial2) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .tk-topbar {
    grid-column: 1 / -1;
    background: var(--tk-panel-bg);
    border-bottom: 1px solid var(--tk-border);
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

  .tk-topbar-left  { display: flex; align-items: center; gap: 20px; }
  .tk-topbar-right { display: flex; align-items: center; gap: 14px; }

  .tk-topbar-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 5px;
    color: var(--tk-accent);
    text-shadow: 0 0 20px var(--tk-accent-glow);
  }

  .tk-topbar-home {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--tk-muted);
    text-decoration: none;
    border: 1px solid var(--tk-border);
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .tk-topbar-home:hover {
    border-color: var(--tk-accent);
    color: var(--tk-text);
    background: var(--tk-input-bg);
  }
  .tk-btn {
      font-family: 'Orbitron', sans-serif;
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      border: 1px solid var(--tk-border);
      background: transparent;
      color: var(--tk-muted);
      padding: 9px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }

    .tk-btn:hover {
      border-color: var(--tk-red);
      color: var(--tk-red);
      background: var(--tk-input-bg);
    }

  .tk-theme-toggle {
    width: 52px; height: 28px;
    border-radius: 14px;
    border: 1px solid var(--tk-border);
    background: var(--tk-panel-bg);
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
    padding: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .tk-theme-knob {
    position: absolute;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--tk-accent);
    top: 2px;
    transition: transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
  }

  .tk-theme-knob.is-dark  { transform: translateX(3px); }
  .tk-theme-knob.is-light { transform: translateX(27px); }

  .tk-left-panel, .tk-right-panel {
    padding: 20px 16px;
    border-right: 1px solid var(--tk-border);
    overflow-y: auto;
    max-height: calc(100vh - 56px);
    position: sticky;
    top: 56px;
    align-self: start;
    background: var(--tk-bg);
    transition: border-color 0.3s;
    z-index: 1;
  }

  .tk-right-panel { border-right: none; border-left: 1px solid var(--tk-border); }

  .tk-panel {
    background: var(--tk-panel-bg);
    border: 1px solid var(--tk-border);
    border-radius: 10px;
    padding: 18px;
    position: relative;
    box-shadow: var(--tk-shadow);
    margin-bottom: 14px;
    transition: background 0.3s, border-color 0.3s;
  }

  .tk-panel:last-child { margin-bottom: 0; }

  .tk-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--tk-accent), transparent);
    border-radius: 10px 10px 0 0;
  }

  .tk-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--tk-muted);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--tk-border);
  }

  .tk-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--tk-border);
  }

  .tk-stat-row:last-child { border-bottom: none; }

  .tk-stat-label {
    color: var(--tk-muted);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .tk-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--tk-text);
  }

  .tk-stat-value.red    { color: var(--tk-red); }
  .tk-stat-value.green  { color: var(--tk-green); }
  .tk-stat-value.yellow { color: var(--tk-yellow); }
  .tk-stat-value.blue   { color: var(--tk-accent); }

  .tk-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    font-weight: 700;
    min-width: 26px;
    height: 22px;
    padding: 0 6px;
    border-radius: 4px;
    border: 1px solid var(--tk-key-border);
    background: var(--tk-input-bg);
    color: var(--tk-text);
    box-shadow: var(--tk-key-shadow);
  }

  .tk-control-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--tk-border);
    font-size: 11px;
    color: var(--tk-muted);
  }

  .tk-control-row:last-child { border-bottom: none; }
  .tk-control-keys { display: flex; gap: 4px; flex-shrink: 0; }

  .tk-center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 28px 20px;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .tk-banner {
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 12px 32px;
    border-radius: 8px;
    animation: tkSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .tk-banner.win {
    color: var(--tk-green);
    border: 1px solid var(--tk-green);
    background: var(--tk-input-bg);
    box-shadow: 0 0 30px var(--tk-green-glow);
  }

  .tk-banner.lose {
    color: var(--tk-red);
    border: 1px solid var(--tk-red);
    background: var(--tk-input-bg);
    box-shadow: 0 0 30px var(--tk-red-glow);
  }

  @keyframes tkSlideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  .tk-dots { display: flex; gap: 6px; align-items: center; }
  .tk-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--tk-accent);
    animation: tkBlink 1s infinite;
  }
  .tk-dots span:nth-child(2) { animation-delay: 0.2s; }
  .tk-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes tkBlink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%           { opacity: 1;   transform: scale(1); }
  }

  @media (max-width: 900px) {
    .tk-root { grid-template-columns: 1fr; }
    .tk-left-panel, .tk-right-panel { position: static; max-height: none; border: none; border-bottom: 1px solid var(--tk-border); }
    .tk-topbar { position: static; }
  }
`;

// ── Token blocks — only these swap on theme change ───────────────────────────
const LIGHT_TOKENS = `
  .tk-root {
    --tk-bg:          #eef1fa;
    --tk-panel-bg:    #ffffff;
    --tk-border:      #dde1f0;
    --tk-text:        #1a1a3a;
    --tk-muted:       #7788bb;
    --tk-input-bg:    #f5f7fd;
    --tk-accent:      #2244dd;
    --tk-accent-glow: #2244dd55;
    --tk-red:         #e5112e;
    --tk-red-glow:    #e5112e33;
    --tk-green:       #007a40;
    --tk-green-glow:  #007a4033;
    --tk-yellow:      #d4a800;
    --tk-shadow:      0 2px 20px #00000014, 0 1px 3px #00000008;
    --tk-radial1:     #2244dd08;
    --tk-radial2:     #e5112e06;
    --tk-key-border:  #c8d0e8;
    --tk-key-shadow:  0 2px 0 #c0c8e0, inset 0 1px 0 #ffffff;
  }
`;

// ── Component ────────────────────────────────────────────────────────────────


export default function TanksPage() {
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const { gameState, send } = useTanksSocket(sessionId);
  useTankInput(send);

  const playerTank  = gameState?.tanks?.player;
  const botTank     = gameState?.tanks?.ai;
  const bulletCount = gameState?.bullets?.length ?? 0;

  const winner = playerTank && !playerTank.alive ? "lose"
               : botTank    && !botTank.alive    ? "win"
               : null;
  const handleReset = () => resetTankSession(sessionId);

  return (
    <>
      <style>{BASE_STYLES}</style>
      <style>{LIGHT_TOKENS}</style>
      <div className="tk-root">

        {/* ── Topbar ── */}
        <div className="tk-topbar">
          <div className="tk-topbar-left">
            <Link to="/" className="tk-topbar-home">← Home</Link>
            <div className="tk-topbar-title">TANKS</div>
          </div>
          <div className="tk-topbar-right">
            {!gameState && <div className="tk-dots"><span /><span /><span /></div>}
          </div>
        </div>

        {/* ── Left Panel ── */}
        <div className="tk-left-panel">
          <div className="tk-panel">
            <div className="tk-section-title">Your Tank</div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Health</span>
              <span className="tk-stat-value green">{playerTank?.health ?? "—"} / 3</span>
            </div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Status</span>
              <span className={`tk-stat-value ${playerTank?.alive ? "green" : "red"}`}>
                {playerTank ? (playerTank.alive ? "Active" : "Destroyed") : "—"}
              </span>
            </div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Angle</span>
              <span className="tk-stat-value blue">
                {playerTank ? `${Math.round(playerTank.angle)}°` : "—"}
              </span>
            </div>
          </div>

          <div className="tk-panel">
            <div className="tk-section-title">Controls</div>
            <div className="tk-control-row">
              <div className="tk-control-keys">
                <span className="tk-key">↑</span>
                <span className="tk-key">↓</span>
              </div>
              Move
            </div>
            <div className="tk-control-row">
              <div className="tk-control-keys">
                <span className="tk-key">←</span>
                <span className="tk-key">→</span>
              </div>
              Rotate body
            </div>
            <div className="tk-control-row">
              <div className="tk-control-keys">
                <span className="tk-key">Q</span>
                <span className="tk-key">E</span>
              </div>
              Rotate turret
            </div>
            <div className="tk-control-row">
              <div className="tk-control-keys">
                <span className="tk-key">SPC</span>
              </div>
              Fire
            </div>
          </div>
          <div className="tk-panel">

          <button
            className="tk-btn"
            onClick={handleReset}
            style={{ marginTop: "10px" }}
          >
            ↺ Reset Game
          </button>
        </div>
        </div>

        {/* ── Center ── */}
        <div className="tk-center-col">
          {winner === "win"  && <div className="tk-banner win">🏆 Victory!</div>}
          {winner === "lose" && <div className="tk-banner lose">💥 Destroyed</div>}

          {gameState
            ? <TankCanvas gameState={gameState} />
            : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                <div className="tk-dots"><span /><span /><span /></div>
                <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--tk-muted)" }}>
                  Connecting...
                </span>
              </div>
            )
          }

          {gameState && (
            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--tk-muted)" }}>
              {winner ? "Game Over" : playerTank?.alive ? "▶ Your Turn" : "Waiting..."}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="tk-right-panel">
          <div className="tk-panel">
            <div className="tk-section-title">Match</div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Bullets</span>
              <span className="tk-stat-value yellow">{bulletCount}</span>
            </div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Status</span>
              <span className={`tk-stat-value ${winner ? "red" : "green"}`}>
                {winner === "win" ? "Victory" : winner === "lose" ? "Defeat" : "Active"}
              </span>
            </div>
          </div>

          <div className="tk-panel">
            <div className="tk-section-title">Opponent</div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Health</span>
              <span className="tk-stat-value red">{botTank?.health ?? "—"} / 3</span>
            </div>
            <div className="tk-stat-row">
              <span className="tk-stat-label">Status</span>
              <span className={`tk-stat-value ${botTank?.alive ? "yellow" : "green"}`}>
                {botTank ? (botTank.alive ? "Active" : "Destroyed") : "—"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}