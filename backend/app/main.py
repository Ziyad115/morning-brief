from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import brief, tickers, calendar, earnings, overnight

app = FastAPI(title="Morning Brief API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://morning-brief-8egr.onrender.com",
],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brief.router, prefix="/api")
app.include_router(tickers.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(earnings.router, prefix="/api")
app.include_router(overnight.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
