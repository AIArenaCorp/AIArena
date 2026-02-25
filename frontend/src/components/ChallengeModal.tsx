import { useNavigate } from "react-router-dom";

const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

  .cm-overlay {
    position: fixed;
    inset: 0;
    background: #00000088;
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: cmFadeIn 0.15s ease;
  }

  @keyframes cmFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .cm-modal {
    font-family: 'Rajdhani', sans-serif;
    background: var(--cm-bg);
    border: 1px solid var(--cm-border);
    border-radius: 14px;
    padding: 36px 32px 28px;
    width: 100%;
    max-width: 420px;
    margin: 0 24px;
    position: relative;
    box-shadow: var(--cm-shadow);
    animation: cmSlideUp 0.2s cubic-bezier(0.34, 1.4, 0.64, 1);
  }

  @keyframes cmSlideUp {
    from { transform: translateY(20px) scale(0.97); opacity: 0; }
    to   { transform: translateY(0) scale(1);       opacity: 1; }
  }

  .cm-modal::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--cm-accent), transparent);
    border-radius: 14px 14px 0 0;
  }

  .cm-close {
    position: absolute;
    top: 14px; right: 16px;
    background: transparent;
    border: none;
    color: var(--cm-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: color 0.2s;
    line-height: 1;
  }

  .cm-close:hover { color: var(--cm-text); }

  .cm-icon {
    font-size: 36px;
    text-align: center;
    margin-bottom: 16px;
  }

  .cm-eyebrow {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--cm-muted);
    text-align: center;
    margin-bottom: 8px;
  }

  .cm-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--cm-text);
    text-align: center;
    margin-bottom: 6px;
  }

  .cm-bot-name {
    color: var(--cm-accent);
    text-shadow: 0 0 16px var(--cm-accent-glow);
  }

  .cm-creator {
    font-size: 13px;
    color: var(--cm-muted);
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 24px;
  }

  .cm-stats {
    display: flex;
    gap: 0;
    border: 1px solid var(--cm-border);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 28px;
  }

  .cm-stat {
    flex: 1;
    padding: 14px 12px;
    text-align: center;
    border-right: 1px solid var(--cm-border);
  }

  .cm-stat:last-child { border-right: none; }

  .cm-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: var(--cm-green);
    text-shadow: 0 0 10px var(--cm-green-glow);
    margin-bottom: 3px;
  }

  .cm-stat-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--cm-muted);
  }

  .cm-actions {
    display: flex;
    gap: 10px;
  }

  .cm-btn {
    flex: 1;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 13px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--cm-border);
  }

  .cm-btn.cancel {
    background: transparent;
    color: var(--cm-muted);
  }

  .cm-btn.cancel:hover {
    border-color: var(--cm-accent);
    color: var(--cm-text);
    background: var(--cm-row-bg);
  }

  .cm-btn.confirm {
    background: linear-gradient(135deg, var(--cm-accent), var(--cm-accent-light));
    border-color: transparent;
    color: #fff;
    font-weight: 700;
    box-shadow: 0 0 20px var(--cm-accent-glow);
  }

  .cm-btn.confirm:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
    box-shadow: 0 0 30px var(--cm-accent-glow);
  }
`;

const LIGHT_TOKENS = `
  .cm-modal {
    --cm-bg:           #ffffff;
    --cm-border:       #dde1f0;
    --cm-text:         #1a1a3a;
    --cm-muted:        #7788bb;
    --cm-accent:       #2244dd;
    --cm-accent-light: #4466ff;
    --cm-accent-glow:  #2244dd44;
    --cm-green:        #007a40;
    --cm-green-glow:   #007a4044;
    --cm-row-bg:       #f5f7fd;
    --cm-shadow:       0 8px 40px #00000020, 0 2px 8px #00000010;
  }
`;

type Bot = {
  bot_name: string;
  username: string;
  elo: number;
  weights?: {
    depth: number; create4: number; create3: number; create2: number;
    opponent4: number; opponent3: number; opponent2: number;
  };
};
type Props = { bot: Bot; onClose: () => void; };

const ChallengeModal = ({ bot, onClose }: Props) => {
  const navigate = useNavigate();

  const handleChallenge = () => {
    navigate("/challenge", { state: { bot } });
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <style>{modalStyles + LIGHT_TOKENS}</style>
      <div className="cm-overlay" onClick={handleOverlayClick}>
        <div className="cm-modal">
          <button className="cm-close" onClick={onClose}>✕</button>

          <div className="cm-icon">⚔️</div>
          <div className="cm-eyebrow">Challenge</div>
          <div className="cm-title">
            <span className="cm-bot-name">{bot.bot_name}</span>
          </div>
          <div className="cm-creator">by {bot.username}</div>

          <div className="cm-stats">
            <div className="cm-stat">
              <div className="cm-stat-value">{Math.round(bot.elo)}</div>
              <div className="cm-stat-label">Elo</div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-value">C4</div>
              <div className="cm-stat-label">Game</div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-value" style={{ fontSize: '13px', paddingTop: '2px' }}>Minimax</div>
              <div className="cm-stat-label">AI Type</div>
            </div>
          </div>

          <div className="cm-actions">
            <button className="cm-btn cancel" onClick={onClose}>Cancel</button>
            <button className="cm-btn confirm" onClick={handleChallenge}>
              ⚡ Accept Challenge
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeModal;