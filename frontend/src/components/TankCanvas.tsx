import { useEffect, useRef } from "react";

const ARENA_W = 800;
const ARENA_H = 600;

// ── Draw helpers ────────────────────────────────────────────────────────────

function drawWall(ctx: CanvasRenderingContext2D, w: any) {
  const fillColor  = "#c8d0e8";
  const edgeColor  = "#aab4d4";
  const glowColor  = "#2244dd22";

  ctx.shadowColor = glowColor;
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = fillColor;
  ctx.fillRect(w.x, w.y, w.width, w.height);
  ctx.shadowBlur  = 0;

  // Edge highlight
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth   = 1;
  ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.width - 1, w.height - 1);

  // Inner bevel
  ctx.strokeStyle = "#ffffff60";
  ctx.lineWidth   = 1;
  ctx.strokeRect(w.x + 2, w.y + 2, w.width - 4, w.height - 4);
}

function drawTank(ctx: CanvasRenderingContext2D, tank: any) {
  if (!tank.alive) return;

  const isPlayer  = tank.id === "player";
  const bodyColor = isPlayer
    ? "#e5112e"
    : "#7788aa";
  const trackColor = isPlayer
    ? "#bb0020"
    : "#667788";
  const glowColor  = isPlayer
    ? "#e5112e44"
    : "#778899aa";
  const turretColor = isPlayer
    ? "#cc1133"
    : "#8899bb";

  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.rotate((tank.angle * Math.PI) / 180);

  // Glow under tank
  ctx.shadowColor = glowColor;
  ctx.shadowBlur  = 16;

  // Tracks
  ctx.fillStyle = trackColor;
  ctx.fillRect(-18, -14, 36,  5);  // left track
  ctx.fillRect(-18,   9, 36,  5);  // right track

  // Track segments
  ctx.fillStyle = "#00000010";
  for (let i = -16; i < 18; i += 6) {
    ctx.fillRect(i, -14, 2, 5);
    ctx.fillRect(i,   9, 2, 5);
  }

  // Body
  ctx.shadowBlur = 0;
  ctx.fillStyle  = bodyColor;
  ctx.fillRect(-14, -9, 28, 18);

  // Body highlight
  ctx.fillStyle = "#ffffff40";
  ctx.fillRect(-14, -9, 28, 5);

  // Body edge
  ctx.strokeStyle = "#ffffff60";
  ctx.lineWidth   = 1;
  ctx.strokeRect(-14, -9, 28, 18);

  ctx.restore();

  // Turret (separate rotation from body)
  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.rotate((tank.turret_angle * Math.PI) / 180);

  ctx.shadowColor = glowColor;
  ctx.shadowBlur  = 12;

  // Barrel
  ctx.fillStyle = turretColor;
  ctx.fillRect(2, -3, 22, 6);

  // Barrel highlight
  ctx.fillStyle = "#ffffff40";
  ctx.fillRect(2, -3, 22, 2);

  // Turret dome
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = turretColor;
  ctx.fill();

  // Dome highlight
  ctx.beginPath();
  ctx.arc(-2, -3, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff50";
  ctx.fill();

  ctx.shadowBlur  = 0;
  ctx.restore();

  // Health pips above tank
  const pipCount = 3;
  const pipSpacing = 10;
  const pipStartX = tank.x - ((pipCount - 1) * pipSpacing) / 2;
  for (let i = 0; i < pipCount; i++) {
    const filled = i < tank.health;
    ctx.beginPath();
    ctx.arc(pipStartX + i * pipSpacing, tank.y - 28, 4, 0, Math.PI * 2);
    if (filled) {
      ctx.fillStyle   = "#007a40";
      ctx.shadowColor = "#007a4066";
      ctx.shadowBlur  = 8;
    } else {
      ctx.fillStyle   = "#dde1f0";
      ctx.shadowBlur  = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pip border
    ctx.strokeStyle = "#00000022";
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // Name tag
  ctx.font      = "bold 9px 'Orbitron', monospace";
  ctx.fillStyle = "#7788bb";
  ctx.textAlign = "center";
  ctx.fillText(isPlayer ? "YOU" : "BOT", tank.x, tank.y - 36);
}

function drawBullet(ctx: CanvasRenderingContext2D, b: any) {
  const color = "#d4a800";
  const glow  = "#d4a80066";

  ctx.shadowColor = glow;
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright core
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = "#fff0aa";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  gameState: any;
}

export default function TankCanvas({ gameState }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !gameState) return;

    const bg      = "#eef1fa";
    const gridCol = "#2244dd08";
    const borderC = "#2244dd";
    const borderG = "#2244dd33";

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    // Subtle grid
    ctx.strokeStyle = gridCol;
    ctx.lineWidth   = 1;
    for (let x = 0; x <= ARENA_W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ARENA_H); ctx.stroke();
    }
    for (let y = 0; y <= ARENA_H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA_W, y); ctx.stroke();
    }

    // Radial atmosphere
    const grad = ctx.createRadialGradient(
      ARENA_W * 0.25, ARENA_H * 0.5, 0, ARENA_W * 0.25, ARENA_H * 0.5, ARENA_W * 0.6
    );
    grad.addColorStop(0, "#2244dd06");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ARENA_W, ARENA_H);

    // Walls
    gameState.walls.forEach((w: any) => drawWall(ctx, w));

    // Bullets
    gameState.bullets.forEach((b: any) => drawBullet(ctx, b));

    // Tanks
    Object.values(gameState.tanks).forEach((tank: any) => drawTank(ctx, tank));

    // Border glow
    ctx.shadowColor = borderG;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = borderC;
    ctx.lineWidth   = 2;
    ctx.strokeRect(1, 1, ARENA_W - 2, ARENA_H - 2);
    ctx.shadowBlur  = 0;

  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={ARENA_W}
      height={ARENA_H}
      style={{
        display:      "block",
        borderRadius: "8px",
        boxShadow: "0 0 0 2px #2244dd, 0 8px 40px #2244dd22",
      }}
    />
  );
}