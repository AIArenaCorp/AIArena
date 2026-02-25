from fastapi import APIRouter, BackgroundTasks
from backend.app.db.db import get_database
from backend.app.core.run_battle import run_battle, calculate_elo
from backend.app.turn_based.agents.connect4.validator import UserSubmission

router = APIRouter(prefix="/leaderboard", tags=["connect4"])

@router.get("/get-leaderboard")
async def get_leaderboard(limit: int = 10, offset: int = 0):
    db = get_database()

    cursor = db.agents.find({}, {"_id": 0}).sort("elo", -1).skip(offset).limit(limit)
    leaderboard_data = await cursor.to_list(length=limit)

    total = await db.agents.count_documents({})

    return {
        "leaderboard": leaderboard_data,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/submit-bot")
async def save_and_battle(agent_data: UserSubmission, background_tasks: BackgroundTasks):
    db = get_database()

    agent_dict = agent_data.model_dump()

    await db.agents.update_one(
        {"bot_name": agent_data.bot_name, "username": agent_data.username},
        {
            "$set": {"weights": agent_dict["weights"]},
            "$setOnInsert": {"elo": 1200}
        },
        upsert=True
    )

    background_tasks.add_task(run_gauntlet, agent_data.bot_name)

    return {"status": "Weights saved. Your AI is now battling other bots"}

async def run_gauntlet(bot_name: str):
    db = get_database()
    new_bot = await db.agents.find_one({"bot_name": bot_name})

    opponents = await db.agents.find({"bot_name": {"$ne": bot_name}}).limit(3).to_list(3)

    for opp in opponents:
        result = run_battle(new_bot['weights'], opp['weights'])

        new_bot_elo, opp_elo = calculate_elo(new_bot['elo'], opp['elo'], result)
        print(f"{bot_name}'s new elo = {new_bot_elo} from {new_bot['elo']}, {opp['bot_name']}'s new elo: {opp_elo} from {opp['elo']}")

        await db.agents.update_one({"bot_name": bot_name}, {"$set": {"elo": new_bot_elo}})
        await db.agents.update_one({"bot_name": opp['bot_name']}, {"$set": {"elo": opp_elo}})