from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .routers import analyze, recovery
import os
import threading
import logging
from typing import List
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# ─── Telegram Bot Background Thread ─────────────────────────
def _start_telegram_bot_thread():
    """Launch the Telegram bot in a daemon thread if token is configured."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not token:
        logger.info("ℹ️  TELEGRAM_BOT_TOKEN not set — Telegram bot will not start.")
        return
    try:
        from .services.telegram_bot import run_telegram_bot
        thread = threading.Thread(target=run_telegram_bot, daemon=True, name="telegram-bot")
        thread.start()
        logger.info("🤖 Telegram bot started in background thread.")
    except Exception as e:
        logger.warning(f"⚠️  Could not start Telegram bot: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    _start_telegram_bot_thread()
    yield
    # Shutdown — daemon thread auto-dies

app = FastAPI(title="RakshaOS API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── WebSocket Connection Manager ───────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception:
                dead.append(conn)
        for conn in dead:
            self.disconnect(conn)

manager = ConnectionManager()

# ─── In-Memory Event Store ──────────────────────────────────
event_history: list = []
channel_status: dict = {
    "whatsapp": False,
    "telegram": False,
    "chrome": False,
    "email": False,
    "sms": False,
    "clipboard": False,
    "upi": False,
    "web": False,
}
stats = {
    "total_scanned": 0,
    "threats_detected": 0,
    "safe_count": 0,
}

# Make these accessible to routers
app.state.manager = manager
app.state.event_history = event_history
app.state.channel_status = channel_status
app.state.stats = stats
app.state.family_shield_enabled = True
app.state.quarantine_list = set()

# ─── WebSocket Endpoint ─────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send current state on connect
    try:
        await websocket.send_json({
            "type": "init",
            "channels": channel_status,
            "stats": stats,
            "recent_events": event_history[-20:]
        })
        while True:
            data = await websocket.receive_text()
            # Handle ping/pong keepalive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# ─── REST Endpoints ─────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "channels": channel_status, "stats": stats}

@app.get("/api/history")
async def get_history():
    return {"events": event_history[-50:]}

@app.get("/api/stats")
async def get_stats():
    return stats

@app.get("/api/quarantine")
async def get_quarantine():
    pass
    # We'll use the request app state if needed, but we can also just use a global or pass it
    # Actually, we can just return list(app.state.quarantine_list)
    return {"quarantined_urls": list(app.state.quarantine_list)}

@app.get("/api/channels")
async def get_channels():
    return channel_status

@app.post("/api/channel-status")
async def update_channel_status(data: dict):
    channel = data.get("channel")
    status = data.get("status", False)
    if channel in channel_status:
        channel_status[channel] = status
        await manager.broadcast({
            "type": "channel_update",
            "channels": channel_status
        })
    return {"ok": True}

@app.post("/api/family-shield")
async def toggle_family_shield(data: dict):
    enabled = data.get("enabled", False)
    app.state.family_shield_enabled = enabled
    return {"ok": True, "family_shield_enabled": enabled}

app.include_router(analyze.router, prefix="/api")
app.include_router(recovery.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
