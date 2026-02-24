import { useState } from 'react';
import { Link } from 'react-router-dom';
import LeaderboardTable from '../components/Leaderboard';

const DARK = {
  bg: '#0a0a12',
  panelBg: '#0f0f1e',
  border: '#1e1e3a',
  textPrimary: '#e8e8ff',
  textMuted: '#6666aa',
  accentBlue: '#1a3fff',
  accentBlueGlow: '#1a3fff88',
  neonGreen: '#00ff88',
  neonGreenGlow: '#00ff8888',
  inputBg: '#0a0a1a',
  navShadow: '0 1px 12px #00000044',
  panelShadow: '0 4px 40px #00000088',
  panelInset: 'inset 0 1px 0 #ffffff0a',
  radial1: '#0a1aff18',
  radial2: '#ff224412',
  sectionLine: '#1e1e3a',
  comingSoonBg: '#0f0f1e',
  comingSoonBorder: '#1e1e3a',
};

const LIGHT = {
  bg: '#eef1fa',
  panelBg: '#ffffff',
  border: '#dde1f0',
  textPrimary: '#1a1a3a',
  textMuted: '#7788bb',
  accentBlue: '#2244dd',
  accentBlueGlow: '#2244dd55',
  neonGreen: '#007a40',
  neonGreenGlow: '#007a4055',
  inputBg: '#f5f7fd',
  navShadow: '0 1px 12px #00000014',
  panelShadow: '0 2px 20px #00000014, 0 1px 3px #00000008',
  panelInset: 'inset 0 1px 0 #ffffff80',
  radial1: '#2244dd08',
  radial2: '#e5112e06',
  sectionLine: '#dde1f0',
  comingSoonBg: '#f5f7fd',
  comingSoonBorder: '#dde1f0',
};

const GAMES = [
  {
    id: 'connect4',
    name: 'Connect Four',
    description: 'Drop pieces to connect four in a row. Tune minimax weights and battle for the top spot.',
    route: '/create',
    status: 'live',
    icon: '🔴',
    accent: '#2244dd',
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3×3 strategy. Coming soon with full AI tuning support.',
    route: null,
    status: 'soon',
    icon: '✕',
    accent: '#9944dd',
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Deep strategy, infinite depth. Full engine tuning planned.',
    route: null,
    status: 'soon',
    icon: '♟︎',
    accent: '#dd8800',
  },
];

const homeStyles = (t: typeof DARK) => `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    font-family: 'Rajdhani', sans-serif;
    background: ${t.bg};
    min-height: 100vh;
    width: 100%;
    color: ${t.textPrimary};
    position: relative;
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
  }

  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 50%, ${t.radial1} 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, ${t.radial2} 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .home-inner {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 96px 24px 60px;
  }

  /* Nav */
  .home-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: ${t.panelBg};
    border-bottom: 1px solid ${t.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    z-index: 10;
    box-shadow: ${t.navShadow};
    transition: background 0.3s, border-color 0.3s;
  }

  .home-nav-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 5px;
    color: ${t.accentBlue};
    text-shadow: 0 0 20px ${t.accentBlueGlow};
    text-decoration: none;
  }

  .home-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .home-nav-link {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${t.textMuted};
    text-decoration: none;
    border: 1px solid ${t.border};
    padding: 7px 16px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .home-nav-link:hover {
    border-color: ${t.accentBlue};
    color: ${t.textPrimary};
    background: ${t.inputBg};
    box-shadow: 0 0 16px ${t.accentBlueGlow};
  }

  /* Theme toggle */
  .home-theme-toggle {
    width: 52px;
    height: 28px;
    border-radius: 14px;
    border: 1px solid ${t.border};
    background: ${t.inputBg};
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
    padding: 0;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .home-theme-toggle:hover {
    border-color: ${t.accentBlue};
    box-shadow: 0 0 12px ${t.accentBlueGlow};
  }

  .home-theme-knob {
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${t.accentBlue};
    top: 2px;
    transition: transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }

  .home-theme-knob.is-dark  { transform: translateX(3px); }
  .home-theme-knob.is-light { transform: translateX(27px); }

  /* Hero */
  .home-hero {
    text-align: center;
    margin-bottom: 64px;
  }

  .home-eyebrow {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: ${t.textMuted};
    margin-bottom: 20px;
  }

  .home-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(36px, 7vw, 72px);
    font-weight: 900;
    letter-spacing: 6px;
    line-height: 1.05;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #88aaff 0%, ${t.accentBlue} 40%, #ff2244 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .home-subtitle {
    font-size: 18px;
    color: ${t.textMuted};
    letter-spacing: 1px;
    margin-bottom: 0;
    line-height: 1.6;
  }

  /* Section headers */
  .home-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: ${t.textMuted};
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .home-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, ${t.sectionLine}, transparent);
  }

  /* Game grid */
  .home-games {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
    margin-bottom: 56px;
  }

  .game-card {
    background: ${t.panelBg};
    border: 1px solid ${t.border};
    border-radius: 12px;
    padding: 24px;
    position: relative;
    box-shadow: ${t.panelShadow}, ${t.panelInset};
    transition: all 0.25s;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
  }

  .game-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 12px 12px 0 0;
    transition: opacity 0.2s;
  }

  .game-card.live::before  { background: linear-gradient(90deg, transparent, ${t.accentBlue}, transparent); }
  .game-card.soon::before  { background: linear-gradient(90deg, transparent, ${t.border}, transparent); }

  .game-card.live {
    cursor: pointer;
  }

  .game-card.live:hover {
    transform: translateY(-3px);
    box-shadow: ${t.panelShadow}, 0 0 30px ${t.accentBlueGlow};
    border-color: ${t.accentBlue};
  }

  .game-card.soon {
    opacity: 0.65;
    cursor: default;
  }

  .game-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .game-card-icon {
    font-size: 28px;
    line-height: 1;
  }

  .game-card-badge {
    font-family: 'Orbitron', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid;
  }

  .game-card-badge.live {
    color: ${t.neonGreen};
    border-color: ${t.neonGreen};
    background: ${t.inputBg};
    box-shadow: 0 0 8px ${t.neonGreenGlow};
  }

  .game-card-badge.soon {
    color: ${t.textMuted};
    border-color: ${t.border};
    background: transparent;
  }

  .game-card-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    color: ${t.textPrimary};
  }

  .game-card-desc {
    font-size: 13px;
    color: ${t.textMuted};
    line-height: 1.5;
    flex: 1;
  }

  .game-card-cta {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${t.accentBlue};
    display: flex;
    align-items: center;
    gap: 6px;
    transition: gap 0.2s;
  }

  .game-card.live:hover .game-card-cta { gap: 10px; }

  /* Panel */
  .home-panel {
    background: ${t.panelBg};
    border: 1px solid ${t.border};
    border-radius: 12px;
    padding: 28px;
    box-shadow: ${t.panelShadow}, ${t.panelInset};
    position: relative;
    transition: background 0.3s, border-color 0.3s;
  }

  .home-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${t.accentBlue}, transparent);
    border-radius: 12px 12px 0 0;
  }
`;

const Home = () => {
  const [isDark, setIsDark] = useState(false);
  const t = isDark ? DARK : LIGHT;

  return (
    <>
      <style>{homeStyles(t)}</style>
      <div className="home-root">

        {/* Nav */}
        <nav className="home-nav">
          <span className="home-nav-title">AI ARENA</span>
          <div className="home-nav-right">
            <Link to="/create" className="home-nav-link">Play Connect Four →</Link>
            <button
              className="home-theme-toggle"
              onClick={() => setIsDark(d => !d)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className={`home-theme-knob ${isDark ? 'is-dark' : 'is-light'}`}>
                {isDark ? '☀️' : '🌙'}
              </div>
            </button>
          </div>
        </nav>

        <div className="home-inner">

          {/* Hero */}
          <div className="home-hero">
            <div className="home-eyebrow">Minimax AI · Strategy Games</div>
            <h1 className="home-title">AI ARENA</h1>
            <p className="home-subtitle">
              Tune your AI's personality, watch it battle, and climb the leaderboard.
            </p>
          </div>

          {/* Game selector */}
          <div className="home-section-title">Choose Your Game</div>
          <div className="home-games">
            {GAMES.map(game => {
              const inner = (
                <>
                  <div className="game-card-header">
                    <span className="game-card-icon">{game.icon}</span>
                    <span className={`game-card-badge ${game.status}`}>
                      {game.status === 'live' ? '● Live' : 'Coming Soon'}
                    </span>
                  </div>
                  <div className="game-card-name">{game.name}</div>
                  <div className="game-card-desc">{game.description}</div>
                  {game.status === 'live' && (
                    <div className="game-card-cta">Play Now →</div>
                  )}
                </>
              );

              return game.route ? (
                <Link key={game.id} to={game.route} className={`game-card ${game.status}`}>
                  {inner}
                </Link>
              ) : (
                <div key={game.id} className={`game-card ${game.status}`}>
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Leaderboard */}
          <div className="home-section-title">Leaderboard · Connect Four</div>
          <div className="home-panel">
            <LeaderboardTable isDark={isDark} />
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;