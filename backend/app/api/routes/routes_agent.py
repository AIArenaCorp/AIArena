from fastapi import APIRouter, Body
from backend.app.agents.connect4.validator import Connect4AIWeights
from backend.app.agents.connect4.dummy import DummyConnect4Agent

router = APIRouter(prefix="/agent", tags=["connect4"])

sim_agent = DummyConnect4Agent(name="Training_Dummy")

@router.post("/update-weights")
async def update_weights(weights: Connect4AIWeights):
    sim_agent.update_weights(weights.model_dump())
    return {"status": "success", "current_weights": sim_agent.weights}


@router.post("/get-move")
async def get_move(board: list[list[int]] = Body(...)):
    column = sim_agent.get_next_move(board)
    return {"column": column}

