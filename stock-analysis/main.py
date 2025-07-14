from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import efinance as ef
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging

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
    period: Optional[str] = "1"  # 1年数据

class StockAnalysisResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    change_percent: float
    analysis: Dict[str, Any]
    signals: Dict[str, str]
    recommendation: str

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

def calculate_kdj(high, low, close, k_period=9, d_period=3):
    """计算KDJ指标"""
    try:
        if len(close) < k_period:
            return {'k': 50, 'd': 50, 'j': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

        # 计算RSV
        rsv = []
        for i in range(len(close)):
            if i < k_period - 1:
                rsv.append(50)
            else:
                period_high = max(high[i-k_period+1:i+1])
                period_low = min(low[i-k_period+1:i+1])
                if period_high == period_low:
                    rsv.append(50)
                else:
                    rsv.append((close[i] - period_low) / (period_high - period_low) * 100)

        # 计算K值
        k_values = [50]  # K值初始值
        for i in range(1, len(rsv)):
            k_val = (2/3) * k_values[-1] + (1/3) * rsv[i]
            k_values.append(k_val)

        # 计算D值
        d_values = [50]  # D值初始值
        for i in range(1, len(k_values)):
            d_val = (2/3) * d_values[-1] + (1/3) * k_values[i]
            d_values.append(d_val)

        # 计算J值
        j_values = [3 * k - 2 * d for k, d in zip(k_values, d_values)]

        k_val = k_values[-1]
        d_val = d_values[-1]
        j_val = j_values[-1]

        # 判断金叉死叉
        if len(k_values) > 1 and len(d_values) > 1:
            if k_values[-2] <= d_values[-2] and k_values[-1] > d_values[-1]:
                signal = 'golden_cross'
            elif k_values[-2] >= d_values[-2] and k_values[-1] < d_values[-1]:
                signal = 'death_cross'
            else:
                signal = 'neutral'
        else:
            signal = 'neutral'

        return {
            'k': k_val,
            'd': d_val,
            'j': j_val,
            'signal': signal,
            'overbought': k_val > 80 and d_val > 80,
            'oversold': k_val < 20 and d_val < 20
        }
    except Exception as e:
        logger.error(f"KDJ calculation error: {e}")
        return {'k': 50, 'd': 50, 'j': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

def calculate_moving_averages(prices):
    """计算移动平均线"""
    try:
        ma5 = calculate_sma(prices, 5)
        ma10 = calculate_sma(prices, 10)
        ma20 = calculate_sma(prices, 20)
        ma60 = calculate_sma(prices, 60)

        current_price = prices[-1]
        ma5_val = ma5[-1] if not np.isnan(ma5[-1]) else current_price
        ma10_val = ma10[-1] if not np.isnan(ma10[-1]) else current_price
        ma20_val = ma20[-1] if not np.isnan(ma20[-1]) else current_price
        ma60_val = ma60[-1] if not np.isnan(ma60[-1]) else current_price

        # 判断多头排列
        bullish_alignment = ma5_val > ma10_val > ma20_val > ma60_val

        # 判断金叉死叉
        if len(ma5) > 1 and len(ma20) > 1:
            if not np.isnan(ma5[-2]) and not np.isnan(ma20[-2]):
                if ma5[-2] <= ma20[-2] and ma5[-1] > ma20[-1]:
                    cross_signal = 'golden_cross'
                elif ma5[-2] >= ma20[-2] and ma5[-1] < ma20[-1]:
                    cross_signal = 'death_cross'
                else:
                    cross_signal = 'neutral'
            else:
                cross_signal = 'neutral'
        else:
            cross_signal = 'neutral'

        return {
            'ma5': float(ma5_val),
            'ma10': float(ma10_val),
            'ma20': float(ma20_val),
            'ma60': float(ma60_val),
            'bullish_alignment': bullish_alignment,
            'cross_signal': cross_signal,
            'above_ma20': current_price > ma20_val
        }
    except Exception as e:
        logger.error(f"Moving averages calculation error: {e}")
        return {
            'ma5': 0, 'ma10': 0, 'ma20': 0, 'ma60': 0,
            'bullish_alignment': False, 'cross_signal': 'neutral', 'above_ma20': False
        }

def calculate_volume_analysis(volume, prices):
    """计算量能分析"""
    try:
        volume_ma5 = calculate_sma(volume, 5)
        volume_ma10 = calculate_sma(volume, 10)

        current_volume = volume[-1]
        vol_ma5 = volume_ma5[-1] if not np.isnan(volume_ma5[-1]) else current_volume
        vol_ma10 = volume_ma10[-1] if not np.isnan(volume_ma10[-1]) else current_volume
        
        # 量价配合分析
        price_up = len(prices) > 1 and prices[-1] > prices[-2]
        volume_up = current_volume > vol_ma5
        
        if price_up and volume_up:
            volume_price_signal = 'bullish'
        elif not price_up and volume_up:
            volume_price_signal = 'bearish'
        else:
            volume_price_signal = 'neutral'
        
        return {
            'current_volume': current_volume,
            'volume_ma5': vol_ma5,
            'volume_ma10': vol_ma10,
            'volume_ratio': current_volume / vol_ma5 if vol_ma5 > 0 else 1,
            'volume_price_signal': volume_price_signal
        }
    except Exception as e:
        logger.error(f"Volume analysis error: {e}")
        return {
            'current_volume': 0, 'volume_ma5': 0, 'volume_ma10': 0,
            'volume_ratio': 1, 'volume_price_signal': 'neutral'
        }

def generate_recommendation(analysis):
    """生成投资建议"""
    score = 0
    signals = []
    
    # MACD分析
    if analysis['macd']['trend'] == 'bullish':
        score += 1
        signals.append("MACD呈多头趋势")
    
    # KDJ分析
    if analysis['kdj']['signal'] == 'golden_cross':
        score += 2
        signals.append("KDJ金叉信号")
    elif analysis['kdj']['oversold']:
        score += 1
        signals.append("KDJ超卖区域")
    elif analysis['kdj']['overbought']:
        score -= 1
        signals.append("KDJ超买区域")
    
    # 均线分析
    if analysis['ma']['bullish_alignment']:
        score += 2
        signals.append("均线多头排列")
    if analysis['ma']['cross_signal'] == 'golden_cross':
        score += 2
        signals.append("均线金叉")
    elif analysis['ma']['cross_signal'] == 'death_cross':
        score -= 2
        signals.append("均线死叉")
    
    # 量能分析
    if analysis['volume']['volume_price_signal'] == 'bullish':
        score += 1
        signals.append("量价配合良好")
    
    if score >= 4:
        recommendation = "强烈买入"
    elif score >= 2:
        recommendation = "买入"
    elif score >= 0:
        recommendation = "持有"
    elif score >= -2:
        recommendation = "卖出"
    else:
        recommendation = "强烈卖出"
    
    return recommendation, signals

@app.get("/")
async def root():
    return {"message": "Stock Analysis API is running"}

@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    try:
        logger.info(f"Analyzing stock: {request.symbol}")
        
        # 获取股票数据
        try:
            # 获取股票基本信息
            stock_info = ef.stock.get_realtime_quotes(request.symbol)
            if stock_info.empty:
                raise HTTPException(status_code=404, detail="Stock not found")
            
            stock_name = stock_info.iloc[0]['股票名称']
            current_price = float(stock_info.iloc[0]['最新价'])
            change_percent = float(stock_info.iloc[0]['涨跌幅'])
            
            # 获取历史数据
            end_date = datetime.now().strftime('%Y%m%d')
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
            
            hist_data = ef.stock.get_quote_history(request.symbol, beg=start_date, end=end_date)
            if hist_data.empty:
                raise HTTPException(status_code=404, detail="No historical data found")
            
        except Exception as e:
            logger.error(f"Data fetching error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")
        
        # 准备数据
        prices = hist_data['收盘'].values.astype(float)
        high = hist_data['最高'].values.astype(float)
        low = hist_data['最低'].values.astype(float)
        volume = hist_data['成交量'].values.astype(float)
        
        # 计算技术指标
        macd_analysis = calculate_macd(prices)
        kdj_analysis = calculate_kdj(high, low, prices)
        ma_analysis = calculate_moving_averages(prices)
        volume_analysis = calculate_volume_analysis(volume, prices)
        
        # 综合分析
        analysis = {
            'macd': macd_analysis,
            'kdj': kdj_analysis,
            'ma': ma_analysis,
            'volume': volume_analysis
        }
        
        recommendation, signals = generate_recommendation(analysis)
        
        return StockAnalysisResponse(
            symbol=request.symbol,
            name=stock_name,
            current_price=current_price,
            change_percent=change_percent,
            analysis=analysis,
            signals={'signals': signals},
            recommendation=recommendation
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/search/{query}")
async def search_stocks(query: str):
    """搜索股票"""
    try:
        # 简单的股票搜索
        results = ef.stock.get_realtime_quotes()
        if not results.empty:
            # 过滤包含查询关键词的股票
            filtered = results[
                results['股票名称'].str.contains(query, na=False) | 
                results['股票代码'].str.contains(query, na=False)
            ].head(10)
            
            return {
                "results": [
                    {
                        "symbol": row['股票代码'],
                        "name": row['股票名称'],
                        "price": row['最新价'],
                        "change": row['涨跌幅']
                    }
                    for _, row in filtered.iterrows()
                ]
            }
        return {"results": []}
    except Exception as e:
        logger.error(f"Search error: {e}")
        return {"results": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
