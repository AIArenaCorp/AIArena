from dataclasses import dataclass, field
from typing import Optional
import uuid

@dataclass
class Vector2:
    x: float
    y: float

@dataclass
class Tank:
    id: str
    position: Vector2
    angle: float
    turret_angle: float
    health: int = 3
    alive: bool = True
    speed: float = 2.0

@dataclass
class Bullet:
    id: str
    position: Vector2
    velocity: Vector2
    bounces_remaining: int = 3
    bounce_cooldown: int = 0

@dataclass
class Wall:
    x: int
    y: int
    width: int
    height: int

@dataclass
class GameState:
    tanks: dict[str, Tank]
    bullets: list[Bullet]
    walls: list[Wall]
    running: bool = True
    tick: int = 0