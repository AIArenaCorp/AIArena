from backend.app.tanks.models import Wall

ARENA_WIDTH = 800
ARENA_HEIGHT = 600

def get_default_walls() -> list[Wall]:
    return [
        Wall(0, 0, ARENA_WIDTH, 10),
        Wall(0, 590, ARENA_WIDTH, 10),
        Wall(0, 0, 10, ARENA_HEIGHT),
        Wall(790, 0, 10, ARENA_HEIGHT),
        Wall(200, 150, 20, 150),
        Wall(400, 100, 20, 200),
        Wall(580, 300, 20, 150),
        Wall(200, 400, 200, 20),
    ]