import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_instance = MongoDB()

async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db_instance.db = db_instance.client.game_database
    await db_instance.db.agents.create_index([("elo", -1)])
    print("Connected to MongoDB")

async def close_mongo_connection():
    db_instance.client.close()
    print("MongoDB connection closed.")

def get_database():
    return db_instance.db