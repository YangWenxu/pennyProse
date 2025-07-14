from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import uvicorn

# 尝试导入efinance，如果失败则使用模拟数据
try:
    import efinance as ef
    EFINANCE_AVAILABLE = True
except ImportError:
    EFINANCE_AVAILABLE = False
    print("Warning: efinance not available, using simulated data only")

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    data_source: str
    last_update: str

def calculate_sma(prices, period):
    """计算简单移动平均线"""
    if len(prices) < period:
        return [np.nan] * len(prices)
    
    sma = []
    for i in range(len(prices)):
        if i < period - 1:
            sma.append(np.nan)
        else:
            sma.append(np.mean(prices[i-period+1:i+1]))
    return np.array(sma)

def calculate_ema(prices, period):
    """计算指数移动平均线"""
    if len(prices) == 0:
        return np.array([])
    
    ema = np.zeros(len(prices))
    ema[0] = prices[0]
    multiplier = 2 / (period + 1)
    
    for i in range(1, len(prices)):
        ema[i] = (prices[i] * multiplier) + (ema[i-1] * (1 - multiplier))
    
    return ema

def calculate_macd(prices, fast=12, slow=26, signal=9):
    """计算MACD指标"""
    try:
        if len(prices) < slow:
            return {'macd': 0, 'signal': 0, 'histogram': 0, 'trend': 'neutral'}
        
        ema_fast = calculate_ema(prices, fast)
        ema_slow = calculate_ema(prices, slow)
        macd_line = ema_fast - ema_slow
        signal_line = calculate_ema(macd_line, signal)
        histogram = macd_line - signal_line
        
        return {
            'macd': float(macd_line[-1]) if len(macd_line) > 0 else 0,
            'signal': float(signal_line[-1]) if len(signal_line) > 0 else 0,
            'histogram': float(histogram[-1]) if len(histogram) > 0 else 0,
            'trend': 'bullish' if macd_line[-1] > signal_line[-1] else 'bearish'
        }
    except Exception as e:
        logger.error(f"MACD calculation error: {e}")
        return {'macd': 0, 'signal': 0, 'histogram': 0, 'trend': 'neutral'}

def get_real_stock_data(symbol):
    """获取真实股票数据"""
    if not EFINANCE_AVAILABLE:
        return None, None, None, None, None, None, None

    try:
        logger.info(f"Fetching real data for {symbol}")

        # 获取实时行情
        stock_info = ef.stock.get_realtime_quotes(symbol)
        if stock_info.empty:
            logger.warning(f"No real-time data for {symbol}")
            return None, None, None, None, None, None, None

        stock_name = stock_info.iloc[0]['股票名称']
        current_price = float(stock_info.iloc[0]['最新价'])
        change_percent = float(stock_info.iloc[0]['涨跌幅'])

        # 获取历史数据
        end_date = datetime.now().strftime('%Y%m%d')
        start_date = (datetime.now() - timedelta(days=100)).strftime('%Y%m%d')

        hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
        if hist_data.empty:
            logger.warning(f"No historical data for {symbol}")
            return stock_name, current_price, change_percent, None, None, None, None

        prices = hist_data['收盘'].values.astype(float)
        high = hist_data['最高'].values.astype(float)
        low = hist_data['最低'].values.astype(float)
        volume = hist_data['成交量'].values.astype(float)

        logger.info(f"Successfully fetched real data for {symbol}")
        return stock_name, current_price, change_percent, prices, high, low, volume

    except Exception as e:
        logger.error(f"Error fetching real data for {symbol}: {e}")
        return None, None, None, None, None, None, None

def generate_simulated_data(symbol):
    """生成模拟股票数据"""
    np.random.seed(hash(symbol) % 2**32)
    
    # 基础参数
    base_price = 10 + (hash(symbol) % 50)
    days = 100
    
    # 生成价格序列
    prices = []
    current_price = base_price
    for _ in range(days):
        change = np.random.normal(0, 0.02)
        current_price = current_price * (1 + change)
        prices.append(current_price)
    
    prices = np.array(prices)
    high = prices * (1 + np.random.uniform(0, 0.05, days))
    low = prices * (1 - np.random.uniform(0, 0.05, days))
    volume = np.random.uniform(500000, 2000000, days)
    
    # 模拟当前价格和涨跌幅
    current_price = prices[-1]
    change_percent = ((prices[-1] - prices[-2]) / prices[-2]) * 100 if len(prices) > 1 else 0
    stock_name = f"模拟股票{symbol}"
    
    return stock_name, current_price, change_percent, prices, high, low, volume

def calculate_technical_indicators(prices, high, low, volume):
    """计算所有技术指标"""
    # 这里简化实现，只计算基本指标
    ma5 = calculate_sma(prices, 5)
    ma20 = calculate_sma(prices, 20)
    
    # MACD
    macd_analysis = calculate_macd(prices)
    
    # 简化的其他指标
    analysis = {
        'macd': macd_analysis,
        'kdj': {'k': 50, 'd': 50, 'j': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False},
        'ma': {
            'ma5': float(ma5[-1]) if not np.isnan(ma5[-1]) else prices[-1],
            'ma10': float(prices[-1]),
            'ma20': float(ma20[-1]) if not np.isnan(ma20[-1]) else prices[-1],
            'ma60': float(prices[-1]),
            'bullish_alignment': bool(ma5[-1] > ma20[-1]) if not np.isnan(ma5[-1]) and not np.isnan(ma20[-1]) else False,
            'cross_signal': 'neutral',
            'above_ma20': bool(prices[-1] > ma20[-1]) if not np.isnan(ma20[-1]) else True
        },
        'volume': {
            'current_volume': float(volume[-1]),
            'volume_ma5': float(np.mean(volume[-5:])),
            'volume_ma10': float(np.mean(volume[-10:])),
            'volume_ratio': 1.2,
            'volume_price_signal': 'neutral'
        },
        'rsi': {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False},
        'boll': {'upper': prices[-1] * 1.1, 'middle': prices[-1], 'lower': prices[-1] * 0.9, 'position': 'middle', 'squeeze': False, 'width': 0.1},
        'wr': {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}
    }
    
    return analysis

def generate_recommendation(analysis):
    """生成投资建议"""
    score = 0
    signals = []
    
    if analysis['macd']['trend'] == 'bullish':
        score += 1
        signals.append("MACD呈多头趋势")
    
    if analysis['ma']['bullish_alignment']:
        score += 1
        signals.append("均线多头排列")
    
    if score >= 2:
        recommendation = "买入"
    elif score >= 1:
        recommendation = "持有"
    else:
        recommendation = "观望"
    
    return recommendation, signals

@app.get("/")
async def root():
    return {
        "message": "Stock Analysis API is running",
        "efinance_available": EFINANCE_AVAILABLE,
        "current_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    try:
        logger.info(f"Analyzing stock: {request.symbol}")
        
        # 尝试获取真实数据
        real_data = get_real_stock_data(request.symbol)

        if real_data[0] is None:
            # 使用模拟数据
            stock_name, current_price, change_percent, prices, high, low, volume = generate_simulated_data(request.symbol)
            data_source = "simulated"
        else:
            stock_name, current_price, change_percent, prices, high, low, volume = real_data
            data_source = "real"
        
        # 计算技术指标
        analysis = calculate_technical_indicators(prices, high, low, volume)
        
        # 生成投资建议
        recommendation, signals = generate_recommendation(analysis)
        
        return StockAnalysisResponse(
            symbol=request.symbol,
            name=stock_name,
            current_price=round(current_price, 2),
            change_percent=round(change_percent, 2),
            analysis=analysis,
            signals={'signals': signals},
            recommendation=recommendation,
            data_source=data_source,
            last_update=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
