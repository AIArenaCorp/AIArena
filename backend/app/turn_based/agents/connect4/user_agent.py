from pydantic import BaseModel, Field
from typing import Dict

class AgentType:
    CONNECT4 = "connect4"
    # CHESS = "chess"
    # TICTACTOE = "tictactoe"


class AIAgent(BaseModel):
    username: str
    bot_name: str
    bot_type: AgentType
    weights: Dict[str, float]
    elo: float = 1200.0
    wins: int = 0
    losses: int = 0

    class Config:
        schema_extra = {
            "example": {
                "username": "Test_User",
                "bot_name": "Test_Bot_Name",
                "weights": {"w1": 5, "w2": 1, "w3": 20}
            }
        }