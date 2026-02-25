from copy import deepcopy

from backend.app.tanks.models import GameState, Tank, Vector2
from backend.app.tanks.arena import get_default_walls
from backend.app.tanks.physics import move_tank, rotate_tank, rotate_turret, fire_bullet, update_bullets
import uuid, time

SPAWN_POSITIONS = [
    Vector2(100, 100),
    Vector2(700, 500),
]

class TankSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.last_fire: dict[str, float] = {}
        self.fire_cooldown = 0.5

        player_id = "player"
        ai_id = "ai"

        self.state = GameState(
            tanks={
                player_id: Tank(id=player_id, position=deepcopy(SPAWN_POSITIONS[0]), angle=0, turret_angle=0),
                ai_id: Tank(id=ai_id, position=deepcopy(SPAWN_POSITIONS[1]), angle=180, turret_angle=180),
            },
            bullets=[],
            walls=get_default_walls(),
        )

    def handle_input(self, input: dict):
        tank = self.state.tanks.get("player")
        if not tank or not tank.alive:
            return
        if input.get("move"):
            move_tank(tank, input["move"], self.state)
        if "rotate" in input:
            rotate_tank(tank, input["rotate"], self.state)
        if "turret" in input:
            rotate_turret(tank, input["turret"])
        if input.get("shoot"):
            now = time.time()
            if now - self.last_fire.get("player", 0) >= self.fire_cooldown:
                self.state.bullets.append(fire_bullet(tank))
                self.last_fire["player"] = now

    def tick(self):
        update_bullets(self.state)
        self.state.tick += 1

    def serialize(self) -> dict:
        return {
            "tick": self.state.tick,
            "tanks": {
                tid: {
                    "id": t.id,
                    "x": t.position.x,
                    "y": t.position.y,
                    "angle": t.angle,
                    "turret_angle": t.turret_angle,
                    "health": t.health,
                    "alive": t.alive,
                }
                for tid, t in self.state.tanks.items()
            },
            "bullets": [
                {"id": b.id, "x": b.position.x, "y": b.position.y}
                for b in self.state.bullets
            ],
            "walls": [
                {"x": w.x, "y": w.y, "width": w.width, "height": w.height}
                for w in self.state.walls
            ],
            "running": self.state.running,
        }