from fastapi import APIRouter, Body
from backend.app.agents.connect4.validator import Connect4AIWeights
from backend.app.agents.connect4.minimax_agent import MiniMaxConnect4Agent

router = APIRouter(prefix="/agent/minimax", tags=["connect4"])

sim_agent = MiniMaxConnect4Agent(name="MinimaxAgent")

@router.post("/update-minimax-weights")
async def update_weights(weights: Connect4AIWeights):
    print("updating minimax weights")
    sim_agent.update_weights(weights.model_dump())
    return {"status": "success", "current_weights": sim_agent.weights}

@router.post("/get-scores")
async def get_scores(board: list[list[int]] = Body(...)):
    print("getting scores for board:")
    col_scores = sim_agent.get_col_scores(board)
    print(f"Calculated scores: {col_scores}")
    return col_scores
