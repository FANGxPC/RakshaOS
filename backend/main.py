from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analyze, recovery

app = FastAPI(title="RakshaOS API", version="1.0.0")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon/demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "RakshaOS API is running"}

app.include_router(analyze.router, prefix="/api")
app.include_router(recovery.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
