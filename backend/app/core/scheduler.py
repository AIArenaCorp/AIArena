import asyncio
import random
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.core.run_battle import run_battle, calculate_elo

async def run_periodic_arena(db: AsyncIOMotorDatabase):
    while True:
        try:
            cursor = db.agents.find()
            all_bots = await cursor.to_list(length=1000)

            if len(all_bots) >= 2:
                sample_size = min(len(all_bots), 20)
                participants = random.sample(all_bots, sample_size)

                if len(participants) % 2 != 0:
                    participants.pop()

                print(f"[{datetime.now()}] Starting Arena Session with {len(participants)} bots.")

                for i in range(0, len(participants), 2):
                    bot_a = participants[i]
                    bot_b = participants[i + 1]


                    winner_index = run_battle(bot_a['weights'], bot_b['weights'])

                    score_a = 1.0 if winner_index == 0 else (0.0 if winner_index == 1 else 0.5)

                    new_elo_a, new_elo_b = calculate_elo(
                        bot_a.get('elo', 1200),
                        bot_b.get('elo', 1200),
                        score_a
                    )
                    print(
                    f"{bot_a.get('bot_name')}'s new elo = {new_elo_a} from {bot_a.get('elo', 1200)}, {bot_b.get('bot_name')}'s new elo: {new_elo_b} from {bot_b.get('elo', 1200)}")

                    await db.agents.update_one({"_id": bot_a["_id"]}, {"$set": {"elo": new_elo_a}})
                    await db.agents.update_one({"_id": bot_b["_id"]}, {"$set": {"elo": new_elo_b}})

                print(f"[{datetime.now()}] Arena session concluded.")

        except Exception as e:
            print(f"Critical Arena Error: {e}")

        await asyncio.sleep(5 * 60)