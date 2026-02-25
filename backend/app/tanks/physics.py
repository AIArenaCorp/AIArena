import math
from backend.app.tanks.models import GameState, Bullet, Vector2, Tank, Wall
import uuid

BULLET_SPEED = 6.0
TANK_RADIUS = 16
BULLET_RADIUS = 4
TANK_WIDTH = 16
TANK_LENGTH = 16
def move_tank(tank: Tank, direction: str, state: GameState, delta: float = 1.0):
    if not tank.alive:
        return
    rad = math.radians(tank.angle)
    cur_pos = tank.position.x, tank.position.y


    if direction == "forward":
        tank.position.x += math.cos(rad) * tank.speed * delta
        tank.position.y += math.sin(rad) * tank.speed * delta
    elif direction == "backward":
        tank.position.x -= math.cos(rad) * tank.speed * delta
        tank.position.y -= math.sin(rad) * tank.speed * delta
    for wall in state.walls:
        if check_tank_wall_collision(tank, wall):
            tank.position.x, tank.position.y = cur_pos
            break


def rotate_tank(tank: Tank, delta_angle: float, state: GameState,):
    old_angle = tank.angle
    tank.angle = (tank.angle + delta_angle) % 360

    for wall in state.walls:
        if check_tank_wall_collision(tank, wall):
            tank.angle = old_angle
            break


def rotate_turret(tank: Tank, delta_angle: float):
    tank.turret_angle = (tank.turret_angle + delta_angle) % 360

def fire_bullet(tank: Tank) -> Bullet:
    rad = math.radians(tank.turret_angle)
    spawn =TANK_RADIUS + BULLET_RADIUS + 5
    return Bullet(
        id=str(uuid.uuid4()),
        position=Vector2(
            tank.position.x + math.cos(rad) * spawn,
            tank.position.y + math.sin(rad) * spawn,
        ),
        velocity=Vector2(
            math.cos(rad) * BULLET_SPEED,
            math.sin(rad) * BULLET_SPEED,
        ),
    )

def reflect_velocity(velocity: Vector2, normal: Vector2) -> Vector2:
    dot = velocity.x * normal.x + velocity.y * normal.y
    return Vector2(
        velocity.x - 2 * dot * normal.x,
        velocity.y - 2 * dot * normal.y,
    )

def update_bullets(state: GameState):
    to_remove = []
    for bullet in state.bullets:

        if bullet.bounce_cooldown > 0:
            bullet.bounce_cooldown -= 1

        substeps = 3
        dx = bullet.velocity.x / substeps
        dy = bullet.velocity.y / substeps

        hit_tank = False
        for _ in range(substeps):
            bullet.position.x += dx
            bullet.position.y += dy

            if bullet.bounce_cooldown == 0:
                for wall in state.walls:
                    if check_bullet_wall_collision(bullet, wall):
                        normal = get_wall_normal(bullet, wall)
                        bullet.velocity = reflect_velocity(bullet.velocity, normal)
                        dx = bullet.velocity.x / substeps
                        dy = bullet.velocity.y / substeps
                        bullet.bounces_remaining -= 1
                        bullet.bounce_cooldown = 5
                        break

            # Tank hit
            for tank in state.tanks.values():
                if tank.alive and check_bullet_tank_collision(bullet, tank):
                    tank.health -= 1
                    if tank.health <= 0:
                        tank.alive = False
                    to_remove.append(bullet)
                    hit_tank = True
                    break

            if hit_tank:
                break

        if bullet.bounces_remaining < 0:
            to_remove.append(bullet)

    state.bullets = [b for b in state.bullets if b not in to_remove]

def check_bullet_wall_collision(bullet: Bullet, wall: Wall) -> bool:
    return (wall.x <= bullet.position.x <= wall.x + wall.width and
            wall.y <= bullet.position.y <= wall.y + wall.height)

def check_tank_wall_collision(tank: Tank, wall: Wall) -> bool:
    rad = math.radians(tank.angle)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    def point(local_x, local_y):
        return (
            tank.position.x + (local_x * cos_a - local_y * sin_a),
            tank.position.y + (local_x * sin_a + local_y * cos_a),
        )

    points = [
        point(-TANK_WIDTH,  -TANK_LENGTH),
        point( TANK_WIDTH,  -TANK_LENGTH),
        point(-TANK_WIDTH,   TANK_LENGTH),
        point( TANK_WIDTH,   TANK_LENGTH),
        point(0,  -TANK_LENGTH),
        point(0,   TANK_LENGTH),
        point(-TANK_WIDTH, 0),
        point( TANK_WIDTH, 0),
    ]

    for (px, py) in points:
        if (wall.x <= px <= wall.x + wall.width and
                wall.y <= py <= wall.y + wall.height):
            return True
    return False

def check_bullet_tank_collision(bullet: Bullet, tank: Tank) -> bool:
    dx = bullet.position.x - tank.position.x
    dy = bullet.position.y - tank.position.y
    return math.sqrt(dx*dx + dy*dy) < TANK_RADIUS + BULLET_RADIUS

def get_wall_normal(game_object: Bullet | Tank, wall: Wall) -> Vector2:
    centers_dx = game_object.position.x - (wall.x + wall.width / 2)
    centers_dy = game_object.position.y - (wall.y + wall.height / 2)
    if abs(centers_dx / wall.width) > abs(centers_dy / wall.height):
        return Vector2(1 if centers_dx > 0 else -1, 0)
    return Vector2(0, 1 if centers_dy > 0 else -1)