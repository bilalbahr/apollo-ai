from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort
import numpy as np
from PIL import Image
import io
import os
import sys
import uvicorn
from pydantic import BaseModel

try:
    from api.providers import CLASSES, build_provider, split_label
except ImportError:
    from providers import CLASSES, build_provider, split_label

# Add project root to sys.path to allow importing from bot
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Bot components (graceful fallback)
try:
    from bot.main import bot, dp, load_model as load_bot_model
    from aiogram import types
except BaseException as e:
    # bot/main.py sys.exit()s without TELEGRAM_BOT_TOKEN; SystemExit is not an ImportError.
    print(f"Warning: Could not import bot components: {e}")
    bot = None
    dp = None

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load API Model (Separate session from Bot to avoid conflict or reuse if we want)
# Robust path finding for Vercel and Local
session = None
try:
    # 1. Try finding model in public/models (Development / non-bundled)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, 'public', 'models', 'plant_stress_model.onnx')
    
    if not os.path.exists(MODEL_PATH):
        # 2. Fallback for Vercel Serverless (bundled in same dir)
        MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'plant_stress_model.onnx')

    print(f"Loading ONNX model from {MODEL_PATH}")
    session = ort.InferenceSession(MODEL_PATH)
    print("API Model loaded successfully!")
except Exception as e:
    print(f"Failed to load API model: {e}")
    session = None

# The diagnosis engine. Swap with APOLLO_PROVIDER=local|plantix.
provider = build_provider(session)
print(f"Diagnosis provider: {provider.name if provider else 'none'}")

@app.on_event("startup")
async def on_startup():
    # Initialize Bot resources
    if bot and load_bot_model:
        load_bot_model()
        # Make sure to set webhook URL manually or via helper endpoint
        print("Bot resources initialized for Webhook mode.")

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": provider is not None,
        "provider": provider.name if provider else None,
        "bot_loaded": bot is not None
    }

@app.get("/health")
def health_check_root():
    return health_check()

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if not provider:
        raise HTTPException(status_code=503, detail="No diagnosis provider available")

    try:
        contents = await file.read()
        return provider.diagnose(contents).as_dict()
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_local(file: UploadFile = File(...)):
    return await predict(file)

# Import LLM service
try:
    from api.llm import generate_disease_report
except ImportError:
    try:
        from llm import generate_disease_report
    except:
        print("Warning: Could not import LLM service")
        generate_disease_report = None

class TextAnalysisRequest(BaseModel):
    class_name: str
    confidence: float
    top_probs: list[str] = None

@app.post("/api/analyze-text")
async def analyze_text(request: TextAnalysisRequest):
    if not generate_disease_report:
        return {"report": "AI Insights unavailable (LLM service not loaded)."}
    
    report = generate_disease_report(request.class_name, request.confidence, request.top_probs)
    return {"report": report}

@app.post("/analyze-text")
async def analyze_text_local(request: TextAnalysisRequest):
    return await analyze_text(request)

# ------------------------------------------------------------------
# TELEGRAM BOT WEBHOOK
# ------------------------------------------------------------------

@app.post("/api/webhook/telegram")
async def telegram_webhook(request: Request):
    """
    Handle incoming Telegram updates via Webhook.
    """
    if not bot or not dp:
        return {"status": "error", "message": "Bot not initialized"}

    try:
        data = await request.json()
        update = types.Update(**data)
        await dp.feed_update(bot, update)
        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/set-webhook")
async def set_webhook():
    """
    Helper to set the webhook URL. 
    Usage: Visit /api/set-webhook?url=https://tryapollo.vercel.app/api/webhook/telegram
    """
    if not bot:
        return {"status": "error", "message": "Bot not initialized"}
    
    # We can't easily auto-detect Vercel URL, so we rely on env var or just manual setup via Curl/Browser
    # But we can try to use WEB_APP_URL from bot/main.py if available.
    
    # For now, let's just use the env var passed or default to manual instruction
    webhook_url = os.getenv("WEBHOOK_URL") 
    
    if not webhook_url:
         return {"status": "warning", "message": "Set WEBHOOK_URL env var to: https://tryapollo.vercel.app/api/webhook/telegram"}

    await bot.set_webhook(webhook_url)
    return {"status": "ok", "url": webhook_url}


if __name__ == "__main__":
    print("Starting local server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
