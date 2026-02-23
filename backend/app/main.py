from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.routes_connect4 import router as connect4_routes
from backend.app.api.routes.routes_dummy_agent import router as c4_dummy_agent_routes
from backend.app.api.routes.routes_minimax_agent import router as c4_minimax_agent_routes
from backend.app.api.routes.routes_leaderboard import router as leaderboard_router

from backend.app.db.db import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connect4_routes)
app.include_router(c4_dummy_agent_routes)
app.include_router(c4_minimax_agent_routes)
app.include_router(leaderboard_router)