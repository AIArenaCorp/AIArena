import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard";
import ChallengeModal from "./ChallengeModal";

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

  .lb-wrap {
    width: 100%;
    font-family: 'Rajdhani', sans-serif;
    transition: background 0.3s, color 0.3s;
  }

  .lb-header {
    display: grid;
    grid-template-columns: 56px 1fr 1fr 100px 40px;
    padding: 0 16px 10px;
    border-bottom: 1px solid var(--lb-border);
  }

  .lb-header-cell {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--lb-muted);
  }

  .lb-header-cell.right { text-align: right; }

  .lb-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 8px;
  }

  .lb-row {
    display: grid;
    grid-template-columns: 56px 1fr 1fr 100px 40px;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: var(--lb-row-bg);
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .lb-row::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    border-radius: 2px 0 0 2px;
    background: transparent;
    transition: background 0.2s;
  }

  .lb-row:hover {
    border-color: var(--lb-border);
    background: var(--lb-row-hover-bg);
    transform: translateX(2px);
  }

  .lb-row:hover .lb-challenge-btn {
    opacity: 1;
    transform: scale(1);
  }

  .lb-row.rank-1::before { background: #ffd600; }
  .lb-row.rank-2::before { background: #aab4c8; }
  .lb-row.rank-3::before { background: #cd7c3a; }
  .lb-row.rank-1 { border-color: #ffd60033; }
  .lb-row.rank-2 { border-color: #aab4c822; }
  .lb-row.rank-3 { border-color: #cd7c3a22; }

  .lb-rank {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: var(--lb-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .lb-rank.rank-1 { color: #ffd600; text-shadow: 0 0 12px #ffd60088; }
  .lb-rank.rank-2 { color: #aab4c8; }
  .lb-rank.rank-3 { color: #cd7c3a; }

  .lb-medal { font-size: 14px; }

  .lb-bot {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--lb-accent);
    letter-spacing: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 12px;
  }

  .lb-creator {
    font-size: 13px;
    color: var(--lb-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 12px;
  }

  .lb-elo {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--lb-green);
    text-align: right;
    text-shadow: 0 0 10px var(--lb-green-glow);
  }

  .lb-challenge-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.15s, transform 0.15s;
    color: var(--lb-accent);
  }

  .lb-state {
    padding: 40px 0;
    text-align: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--lb-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .lb-state-icon { font-size: 28px; opacity: 0.4; }

  .lb-loading-dots { display: flex; gap: 6px; align-items: center; }

  .lb-loading-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--lb-accent);
    animation: lbBlink 1s infinite;
  }

  .lb-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .lb-loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes lbBlink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%           { opacity: 1;   transform: scale(1); }
  }

  .lb-footer {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--lb-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lb-count {
    font-size: 11px;
    color: var(--lb-muted);
    letter-spacing: 1px;
  }

  .lb-refresh {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--lb-muted);
    background: transparent;
    border: 1px solid var(--lb-border);
    padding: 5px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .lb-refresh:hover:not(:disabled) {
    border-color: var(--lb-accent);
    color: var(--lb-text);
    background: var(--lb-row-bg);
  }

  .lb-refresh:disabled { opacity: 0.4; cursor: not-allowed; }

  @keyframes lbSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .lb-refresh-icon.spinning {
    display: inline-block;
    animation: lbSpin 0.7s linear infinite;
  }

  .lb-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
  }

  .lb-page-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    letter-spacing: 1px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    border: 1px solid var(--lb-border);
    background: transparent;
    color: var(--lb-muted);
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  .lb-page-btn:hover:not(:disabled):not(.active) {
    border-color: var(--lb-accent);
    color: var(--lb-text);
    background: var(--lb-row-bg);
  }

  .lb-page-btn.active {
    border-color: var(--lb-accent);
    background: var(--lb-row-bg);
    color: var(--lb-accent);
  }

  .lb-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const DARK_TOKENS = `
  .lb-wrap {
    --lb-border:        #1e1e3a;
    --lb-muted:         #6666aa;
    --lb-text:          #e8e8ff;
    --lb-accent:        #1a3fff;
    --lb-green:         #00ff88;
    --lb-green-glow:    #00ff8866;
    --lb-row-bg:        #0a0a1a;
    --lb-row-hover-bg:  #0f0f1e;
  }
`;

const LIGHT_TOKENS = `
  .lb-wrap {
    --lb-border:        #dde1f0;
    --lb-muted:         #7788bb;
    --lb-text:          #1a1a3a;
    --lb-accent:        #2244dd;
    --lb-green:         #007a40;
    --lb-green-glow:    #007a4044;
    --lb-row-bg:        #f5f7fd;
    --lb-row-hover-bg:  #eef1fa;
  }
`;

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export type Bot = {
  bot_name: string;
  username: string;
  elo: number;
  weights?: {
    depth: number; create4: number; create3: number; create2: number;
    opponent4: number; opponent3: number; opponent2: number;
  };
};

type Status = 'loading' | 'loaded' | 'error' | 'empty';
type Props = { isDark?: boolean };

// ✅ PAGE_SIZE is a module-level constant — fine outside the component
const PAGE_SIZE = 10;

const LeaderboardTable = ({ isDark = false }: Props) => {
  // ✅ All useState calls are inside the component
  const [data, setData] = useState<Bot[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [challengeBot, setChallengeBot] = useState<Bot | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // ✅ Derived value — not a hook, just math
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchLeaders = async (p: number) => {
    setStatus('loading');
    try {
      const result = await getLeaderboard(PAGE_SIZE, p * PAGE_SIZE);
      if (result?.leaderboard?.length > 0) {
        setData(result.leaderboard);
        setTotal(result.total ?? 0);
        setStatus('loaded');
      } else {
        setData([]);
        setTotal(result.total ?? 0);
        setStatus(p === 0 ? 'empty' : 'loaded');
      }
    } catch (error) {
      console.error("Leaderboard fetch failed:", error);
      setData([]);
      setStatus('error');
    }
  };

  useEffect(() => { fetchLeaders(page); }, [page]);

  const rankClass = (globalIndex: number) =>
    globalIndex === 0 ? 'rank-1' : globalIndex === 1 ? 'rank-2' : globalIndex === 2 ? 'rank-3' : '';

  return (
    <>
      <style>{BASE_STYLES + (isDark ? DARK_TOKENS : LIGHT_TOKENS)}</style>
      <div className="lb-wrap">

        <div className="lb-header">
          <div className="lb-header-cell">Rank</div>
          <div className="lb-header-cell">Bot</div>
          <div className="lb-header-cell">Creator</div>
          <div className="lb-header-cell right">Elo</div>
          <div className="lb-header-cell" />
        </div>

        {status === 'loading' && (
          <div className="lb-state">
            <div className="lb-loading-dots"><span /><span /><span /></div>
            Fetching standings
          </div>
        )}

        {status === 'error' && (
          <div className="lb-state">
            <div className="lb-state-icon">⚠️</div>
            Failed to load — check your connection
          </div>
        )}

        {status === 'empty' && (
          <div className="lb-state">
            <div className="lb-state-icon">🏆</div>
            No entries yet — be the first!
          </div>
        )}

        {status === 'loaded' && (
          <div className="lb-list">
            {data.map((bot, i) => {
              const globalRank = page * PAGE_SIZE + i;
              const rc = rankClass(globalRank);
              return (
                <div
                  key={globalRank}
                  className={`lb-row ${rc}`}
                  onClick={() => setChallengeBot(bot)}
                  title={`Challenge ${bot.bot_name}`}
                >
                  <div className={`lb-rank ${rc}`}>
                    {MEDALS[globalRank + 1]
                      ? <span className="lb-medal">{MEDALS[globalRank + 1]}</span>
                      : `#${globalRank + 1}`
                    }
                  </div>
                  <div className="lb-bot">{bot.bot_name}</div>
                  <div className="lb-creator">{bot.username}</div>
                  <div className="lb-elo">{Math.round(bot.elo)}</div>
                  <div className="lb-challenge-btn" title="Challenge">⚔️</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination — only shown when there's more than one page */}
        {status === 'loaded' && totalPages > 1 && (
          <div className="lb-pagination">
            <button
              className="lb-page-btn"
              onClick={() => setPage(0)}
              disabled={page === 0}
              title="First page"
            >«</button>
            <button
              className="lb-page-btn"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              title="Previous page"
            >‹</button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`lb-page-btn ${i === page ? 'active' : ''}`}
                onClick={() => setPage(i)}
              >{i + 1}</button>
            ))}

            <button
              className="lb-page-btn"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages - 1}
              title="Next page"
            >›</button>
            <button
              className="lb-page-btn"
              onClick={() => setPage(totalPages - 1)}
              disabled={page === totalPages - 1}
              title="Last page"
            >»</button>
          </div>
        )}

        <div className="lb-footer">
          <span className="lb-count">
            {status === 'loaded'
              ? `${total} bot${total !== 1 ? 's' : ''} ranked · click a row to challenge`
              : '—'}
          </span>
          <button
            className="lb-refresh"
            onClick={() => { setPage(0); fetchLeaders(0); }}
            disabled={status === 'loading'}
          >
            <span className={`lb-refresh-icon ${status === 'loading' ? 'spinning' : ''}`}>↻</span>
            {' '}Refresh
          </button>
        </div>

      </div>

      {challengeBot && (
        <ChallengeModal
          bot={challengeBot}
          isDark={isDark}
          onClose={() => setChallengeBot(null)}
        />
      )}
    </>
  );
};

export default LeaderboardTable;