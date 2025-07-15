from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

app = FastAPI(title="Stock Analysis API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockAnalysisRequest(BaseModel):
    symbol: str
    period: Optional[str] = "1"

class StockAnalysisResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    change_percent: float
    analysis: Dict[str, Any]
    signals: Dict[str, Any]
    recommendation: str

@app.get("/")
async def root():
    return {"message": "Stock Analysis API is running"}

@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    # 模拟数据用于测试
    return StockAnalysisResponse(
        symbol=request.symbol,
        name="测试股票",
        current_price=10.50,
        change_percent=2.5,
        analysis={
            "macd": {
                "macd": 0.15,
                "signal": 0.12,
                "histogram": 0.03,
                "trend": "bullish"
            },
            "kdj": {
                "k": 65.5,
                "d": 62.3,
                "j": 71.9,
                "signal": "golden_cross",
                "overbought": False,
                "oversold": False
            },
            "ma": {
                "ma5": 10.45,
                "ma10": 10.30,
                "ma20": 10.15,
                "ma60": 9.95,
                "bullish_alignment": True,
                "cross_signal": "golden_cross",
                "above_ma20": True
            },
            "volume": {
                "current_volume": 1000000,
                "volume_ma5": 850000,
                "volume_ma10": 800000,
                "volume_ratio": 1.18,
                "volume_price_signal": "bullish"
            }
        },
        signals={"signals": ["MACD呈多头趋势", "KDJ金叉信号", "均线多头排列", "量价配合良好"]},
        recommendation="买入"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
