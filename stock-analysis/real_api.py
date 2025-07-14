from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import uvicorn
import efinance as ef

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stock Analysis API", version="1.0.0")

# 简单的内存存储（生产环境应使用数据库）
watchlist = []  # 自选股列表
alert_rules = []  # 预警规则
backtest_results = {}  # 回测结果缓存

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
    data_source: str  # 'real' or 'simulated'
    last_update: str  # 数据更新时间

class WatchlistItem(BaseModel):
    symbol: str
    name: str
    added_date: str

class AlertRule(BaseModel):
    symbol: str
    condition: str  # 'price_above', 'price_below', 'rsi_overbought', 'rsi_oversold', etc.
    value: float
    message: str
    active: bool = True

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
            'overbought': bool(k_val > 80 and d_val > 80),
            'oversold': bool(k_val < 20 and d_val < 20)
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
        bullish_alignment = bool(ma5_val > ma10_val > ma20_val > ma60_val)
        
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
            'above_ma20': bool(current_price > ma20_val)
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
            'current_volume': float(current_volume),
            'volume_ma5': float(vol_ma5),
            'volume_ma10': float(vol_ma10),
            'volume_ratio': float(current_volume / vol_ma5) if vol_ma5 > 0 else 1,
            'volume_price_signal': volume_price_signal
        }
    except Exception as e:
        logger.error(f"Volume analysis error: {e}")
        return {
            'current_volume': 0, 'volume_ma5': 0, 'volume_ma10': 0,
            'volume_ratio': 1, 'volume_price_signal': 'neutral'
        }

def calculate_rsi(prices, period=14):
    """计算RSI相对强弱指标"""
    try:
        if len(prices) < period + 1:
            return {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        avg_gains = np.zeros(len(gains))
        avg_losses = np.zeros(len(losses))

        # 初始平均值
        avg_gains[period-1] = np.mean(gains[:period])
        avg_losses[period-1] = np.mean(losses[:period])

        # 计算后续的平均值
        for i in range(period, len(gains)):
            avg_gains[i] = (avg_gains[i-1] * (period-1) + gains[i]) / period
            avg_losses[i] = (avg_losses[i-1] * (period-1) + losses[i]) / period

        rs = avg_gains / (avg_losses + 1e-10)  # 避免除零
        rsi = 100 - (100 / (1 + rs))

        current_rsi = rsi[-1]

        # 判断信号
        if current_rsi > 70:
            signal = 'overbought'
            overbought = True
            oversold = False
        elif current_rsi < 30:
            signal = 'oversold'
            overbought = False
            oversold = True
        else:
            signal = 'neutral'
            overbought = False
            oversold = False

        return {
            'rsi': float(current_rsi),
            'signal': signal,
            'overbought': bool(overbought),
            'oversold': bool(oversold)
        }
    except Exception as e:
        logger.error(f"RSI calculation error: {e}")
        return {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带指标"""
    try:
        if len(prices) < period:
            return {'upper': 0, 'middle': 0, 'lower': 0, 'position': 'middle', 'squeeze': False}

        sma = calculate_sma(prices, period)
        std = np.zeros(len(prices))

        for i in range(period-1, len(prices)):
            std[i] = np.std(prices[i-period+1:i+1])

        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)

        current_price = prices[-1]
        current_upper = upper_band[-1]
        current_middle = sma[-1]
        current_lower = lower_band[-1]

        # 判断价格位置
        if current_price > current_upper:
            position = 'above_upper'
        elif current_price < current_lower:
            position = 'below_lower'
        elif current_price > current_middle:
            position = 'upper_half'
        else:
            position = 'lower_half'

        # 判断是否收窄
        band_width = (current_upper - current_lower) / current_middle
        squeeze = band_width < 0.1  # 带宽小于10%认为是收窄

        return {
            'upper': float(current_upper) if not np.isnan(current_upper) else 0,
            'middle': float(current_middle) if not np.isnan(current_middle) else 0,
            'lower': float(current_lower) if not np.isnan(current_lower) else 0,
            'position': position,
            'squeeze': bool(squeeze),
            'width': float(band_width) if not np.isnan(band_width) else 0
        }
    except Exception as e:
        logger.error(f"Bollinger Bands calculation error: {e}")
        return {'upper': 0, 'middle': 0, 'lower': 0, 'position': 'middle', 'squeeze': False, 'width': 0}

def calculate_williams_r(high, low, close, period=14):
    """计算威廉指标"""
    try:
        if len(close) < period:
            return {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

        wr_values = []
        for i in range(period-1, len(close)):
            highest_high = max(high[i-period+1:i+1])
            lowest_low = min(low[i-period+1:i+1])

            if highest_high == lowest_low:
                wr = -50
            else:
                wr = ((highest_high - close[i]) / (highest_high - lowest_low)) * -100

            wr_values.append(wr)

        current_wr = wr_values[-1]

        # 判断信号
        if current_wr > -20:
            signal = 'overbought'
            overbought = True
            oversold = False
        elif current_wr < -80:
            signal = 'oversold'
            overbought = False
            oversold = True
        else:
            signal = 'neutral'
            overbought = False
            oversold = False

        return {
            'wr': float(current_wr),
            'signal': signal,
            'overbought': bool(overbought),
            'oversold': bool(oversold)
        }
    except Exception as e:
        logger.error(f"Williams %R calculation error: {e}")
        return {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

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

    # RSI分析
    if analysis['rsi']['oversold']:
        score += 1
        signals.append("RSI超卖区域")
    elif analysis['rsi']['overbought']:
        score -= 1
        signals.append("RSI超买区域")

    # 布林带分析
    if analysis['boll']['position'] == 'below_lower':
        score += 1
        signals.append("价格跌破布林带下轨")
    elif analysis['boll']['position'] == 'above_upper':
        score -= 1
        signals.append("价格突破布林带上轨")

    # 威廉指标分析
    if analysis['wr']['oversold']:
        score += 1
        signals.append("威廉指标超卖")
    elif analysis['wr']['overbought']:
        score -= 1
        signals.append("威廉指标超买")

    if score >= 5:
        recommendation = "强烈买入"
    elif score >= 3:
        recommendation = "买入"
    elif score >= 0:
        recommendation = "持有"
    elif score >= -3:
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

        # 尝试获取真实股票数据
        data_source = "simulated"
        last_update = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        try:
            logger.info(f"Attempting to fetch real data for {request.symbol}")

            # 尝试多种方式获取实时数据
            stock_info = None

            # 方法1: 直接获取单只股票
            try:
                stock_info = ef.stock.get_realtime_quotes(request.symbol)
                logger.info(f"Method 1 result: {stock_info.shape if not stock_info.empty else 'Empty'}")
            except Exception as e1:
                logger.warning(f"Method 1 failed: {e1}")

                # 方法2: 获取所有股票然后筛选
                try:
                    all_stocks = ef.stock.get_realtime_quotes()
                    if not all_stocks.empty:
                        stock_info = all_stocks[all_stocks['股票代码'] == request.symbol]
                        logger.info(f"Method 2 result: {stock_info.shape if not stock_info.empty else 'Empty'}")
                except Exception as e2:
                    logger.warning(f"Method 2 failed: {e2}")

            if stock_info is not None and not stock_info.empty:
                stock_name = stock_info.iloc[0]['股票名称']
                current_price = float(stock_info.iloc[0]['最新价'])
                change_percent = float(stock_info.iloc[0]['涨跌幅'])
                data_source = "real"

                # 获取历史数据
                end_date = datetime.now().strftime('%Y%m%d')
                start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')

                try:
                    hist_data = ef.stock.get_quote_history(request.symbol, beg=start_date, end=end_date)
                    if not hist_data.empty:
                        # 准备数据
                        prices = hist_data['收盘'].values.astype(float)
                        high = hist_data['最高'].values.astype(float)
                        low = hist_data['最低'].values.astype(float)
                        volume = hist_data['成交量'].values.astype(float)
                        logger.info(f"Successfully fetched {len(prices)} days of historical data")
                    else:
                        raise Exception("Historical data is empty")
                except Exception as hist_e:
                    logger.warning(f"Historical data fetch failed: {hist_e}, using simulated historical data")
                    # 使用实时价格生成模拟历史数据
                    prices, high, low, volume = generate_simulated_history(current_price, request.symbol)
            else:
                raise Exception("No real-time data available")

        except Exception as e:
            logger.warning(f"Failed to fetch real data for {request.symbol}: {e}")
            # 使用模拟数据
            stock_name = f"模拟股票{request.symbol}"
            data_source = "simulated"

            # 生成模拟数据
            np.random.seed(hash(request.symbol) % 2**32)
            base_price = 10 + (hash(request.symbol) % 50)
            change_percent = np.random.uniform(-5, 5)

            prices, high, low, volume = generate_simulated_history(base_price, request.symbol)
            current_price = prices[-1]

def generate_simulated_history(base_price, symbol, days=100):
    """生成模拟历史数据"""
    np.random.seed(hash(symbol) % 2**32)

    prices = []
    current_price = base_price
    for i in range(days):
        change = np.random.normal(0, 0.02)
        current_price = current_price * (1 + change)
        prices.append(current_price)

    prices = np.array(prices)
    high = prices * (1 + np.random.uniform(0, 0.05, days))
    low = prices * (1 - np.random.uniform(0, 0.05, days))
    volume = np.random.uniform(500000, 2000000, days)

    return prices, high, low, volume

        # 计算技术指标
        macd_analysis = calculate_macd(prices)
        kdj_analysis = calculate_kdj(high, low, prices)
        ma_analysis = calculate_moving_averages(prices)
        volume_analysis = calculate_volume_analysis(volume, prices)
        rsi_analysis = calculate_rsi(prices)
        boll_analysis = calculate_bollinger_bands(prices)
        wr_analysis = calculate_williams_r(high, low, prices)

        # 综合分析
        analysis = {
            'macd': macd_analysis,
            'kdj': kdj_analysis,
            'ma': ma_analysis,
            'volume': volume_analysis,
            'rsi': rsi_analysis,
            'boll': boll_analysis,
            'wr': wr_analysis
        }

        recommendation, signals = generate_recommendation(analysis)

        # 计算涨跌幅（如果没有真实涨跌幅数据）
        if data_source == "simulated":
            change_percent = ((prices[-1] - prices[-2]) / prices[-2]) * 100 if len(prices) > 1 else 0

        return StockAnalysisResponse(
            symbol=request.symbol,
            name=stock_name,
            current_price=round(current_price, 2),
            change_percent=round(change_percent, 2),
            analysis=analysis,
            signals={'signals': signals},
            recommendation=recommendation,
            data_source=data_source,
            last_update=last_update
        )

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: Optional[int] = 100):
    """获取股票历史数据用于图表展示"""
    try:
        logger.info(f"Fetching history for stock: {symbol}")

        try:
            # 获取历史数据
            end_date = datetime.now().strftime('%Y%m%d')
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')

            hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
            if hist_data.empty:
                raise HTTPException(status_code=404, detail="No historical data found")

            # 转换数据格式
            history = []
            for _, row in hist_data.iterrows():
                history.append({
                    'date': row['日期'].strftime('%Y-%m-%d'),
                    'open': float(row['开盘']),
                    'high': float(row['最高']),
                    'low': float(row['最低']),
                    'close': float(row['收盘']),
                    'volume': float(row['成交量'])
                })

            return {'symbol': symbol, 'history': history}

        except Exception as e:
            logger.warning(f"Failed to fetch real history for {symbol}: {e}")
            # 如果获取真实数据失败，返回模拟数据
            np.random.seed(hash(symbol) % 2**32)
            base_price = 10 + (hash(symbol) % 50)

            history = []
            current_price = base_price
            for i in range(days):
                date = (datetime.now() - timedelta(days=days-i)).strftime('%Y-%m-%d')
                change = np.random.normal(0, 0.02)
                current_price = current_price * (1 + change)

                high_price = current_price * (1 + np.random.uniform(0, 0.05))
                low_price = current_price * (1 - np.random.uniform(0, 0.05))
                open_price = current_price * (1 + np.random.uniform(-0.02, 0.02))
                volume = np.random.uniform(500000, 2000000)

                history.append({
                    'date': date,
                    'open': round(open_price, 2),
                    'high': round(high_price, 2),
                    'low': round(low_price, 2),
                    'close': round(current_price, 2),
                    'volume': int(volume)
                })

            return {'symbol': symbol, 'history': history}

    except Exception as e:
        logger.error(f"History fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/search/{query}")
async def search_stocks(query: str):
    """搜索股票"""
    try:
        logger.info(f"Searching stocks: {query}")

        try:
            # 尝试获取实时行情数据进行搜索
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
                            "price": float(row['最新价']),
                            "change": float(row['涨跌幅'])
                        }
                        for _, row in filtered.iterrows()
                    ]
                }
        except Exception as e:
            logger.warning(f"Real search failed: {e}")

        # 如果真实搜索失败，返回模拟结果
        mock_results = [
            {"symbol": "000001", "name": "平安银行", "price": 12.50, "change": 1.2},
            {"symbol": "000002", "name": "万科A", "price": 18.30, "change": -0.8},
            {"symbol": "600000", "name": "浦发银行", "price": 8.90, "change": 0.5},
            {"symbol": "600036", "name": "招商银行", "price": 35.20, "change": 2.1},
            {"symbol": "000858", "name": "五粮液", "price": 168.50, "change": -1.5}
        ]

        filtered_mock = [r for r in mock_results if query in r['symbol'] or query in r['name']]
        return {"results": filtered_mock[:5]}

    except Exception as e:
        logger.error(f"Search error: {e}")
        return {"results": []}

# 自选股管理API
@app.get("/watchlist")
async def get_watchlist():
    """获取自选股列表"""
    return {"watchlist": watchlist}

@app.post("/watchlist")
async def add_to_watchlist(symbol: str, name: str):
    """添加股票到自选股"""
    try:
        # 检查是否已存在
        if any(item['symbol'] == symbol for item in watchlist):
            raise HTTPException(status_code=400, detail="Stock already in watchlist")

        watchlist.append({
            "symbol": symbol,
            "name": name,
            "added_date": datetime.now().strftime('%Y-%m-%d')
        })

        return {"message": "Added to watchlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add to watchlist error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add to watchlist")

@app.delete("/watchlist/{symbol}")
async def remove_from_watchlist(symbol: str):
    """从自选股中移除股票"""
    try:
        global watchlist
        original_length = len(watchlist)
        watchlist = [item for item in watchlist if item['symbol'] != symbol]

        if len(watchlist) == original_length:
            raise HTTPException(status_code=404, detail="Stock not found in watchlist")

        return {"message": "Removed from watchlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove from watchlist error: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove from watchlist")

# 预警功能API
@app.get("/alerts")
async def get_alerts():
    """获取预警规则列表"""
    return {"alerts": alert_rules}

@app.post("/alerts")
async def create_alert(alert: AlertRule):
    """创建预警规则"""
    try:
        alert_dict = alert.dict()
        alert_dict['id'] = len(alert_rules) + 1
        alert_dict['created_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        alert_rules.append(alert_dict)

        return {"message": "Alert created successfully", "alert_id": alert_dict['id']}
    except Exception as e:
        logger.error(f"Create alert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create alert")

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    """删除预警规则"""
    try:
        global alert_rules
        original_length = len(alert_rules)
        alert_rules = [alert for alert in alert_rules if alert['id'] != alert_id]

        if len(alert_rules) == original_length:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"message": "Alert deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete alert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete alert")

@app.get("/alerts/check")
async def check_alerts():
    """检查预警条件"""
    try:
        triggered_alerts = []

        for alert in alert_rules:
            if not alert['active']:
                continue

            try:
                # 获取股票当前数据
                stock_info = ef.stock.get_realtime_quotes(alert['symbol'])
                if stock_info.empty:
                    continue

                current_price = float(stock_info.iloc[0]['最新价'])

                # 检查预警条件
                triggered = False
                if alert['condition'] == 'price_above' and current_price > alert['value']:
                    triggered = True
                elif alert['condition'] == 'price_below' and current_price < alert['value']:
                    triggered = True

                if triggered:
                    triggered_alerts.append({
                        'alert_id': alert['id'],
                        'symbol': alert['symbol'],
                        'message': alert['message'],
                        'current_price': current_price,
                        'trigger_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })

            except Exception as e:
                logger.warning(f"Failed to check alert for {alert['symbol']}: {e}")
                continue

        return {"triggered_alerts": triggered_alerts}
    except Exception as e:
        logger.error(f"Check alerts error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check alerts")

# 历史回测API
@app.post("/backtest")
async def run_backtest(symbol: str, strategy: str = "ma_cross", days: int = 100):
    """运行历史回测"""
    try:
        logger.info(f"Running backtest for {symbol} with {strategy} strategy")

        # 获取历史数据
        end_date = datetime.now().strftime('%Y%m%d')
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')

        try:
            hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
            if hist_data.empty:
                raise Exception("No historical data")

            prices = hist_data['收盘'].values.astype(float)
        except:
            # 使用模拟数据
            np.random.seed(hash(symbol) % 2**32)
            base_price = 10 + (hash(symbol) % 50)
            prices = []
            current_price = base_price
            for i in range(days):
                change = np.random.normal(0, 0.02)
                current_price = current_price * (1 + change)
                prices.append(current_price)
            prices = np.array(prices)

        # 简单的均线交叉策略回测
        if strategy == "ma_cross":
            ma5 = calculate_sma(prices, 5)
            ma20 = calculate_sma(prices, 20)

            positions = []  # 持仓记录
            trades = []     # 交易记录
            current_position = 0  # 0: 空仓, 1: 持仓
            buy_price = 0

            for i in range(20, len(prices)):  # 从第20天开始（确保MA20有效）
                if np.isnan(ma5[i]) or np.isnan(ma20[i]):
                    continue

                # 金叉买入信号
                if current_position == 0 and ma5[i] > ma20[i] and ma5[i-1] <= ma20[i-1]:
                    current_position = 1
                    buy_price = prices[i]
                    trades.append({
                        'type': 'buy',
                        'date': i,
                        'price': prices[i],
                        'ma5': ma5[i],
                        'ma20': ma20[i]
                    })

                # 死叉卖出信号
                elif current_position == 1 and ma5[i] < ma20[i] and ma5[i-1] >= ma20[i-1]:
                    current_position = 0
                    profit = (prices[i] - buy_price) / buy_price * 100
                    trades.append({
                        'type': 'sell',
                        'date': i,
                        'price': prices[i],
                        'profit': profit,
                        'ma5': ma5[i],
                        'ma20': ma20[i]
                    })

                positions.append(current_position)

            # 计算回测结果
            buy_trades = [t for t in trades if t['type'] == 'buy']
            sell_trades = [t for t in trades if t['type'] == 'sell']

            total_return = 0
            win_trades = 0

            for sell_trade in sell_trades:
                total_return += sell_trade['profit']
                if sell_trade['profit'] > 0:
                    win_trades += 1

            win_rate = (win_trades / len(sell_trades) * 100) if sell_trades else 0

            result = {
                'symbol': symbol,
                'strategy': strategy,
                'period_days': days,
                'total_trades': len(sell_trades),
                'win_trades': win_trades,
                'win_rate': round(win_rate, 2),
                'total_return': round(total_return, 2),
                'avg_return_per_trade': round(total_return / len(sell_trades), 2) if sell_trades else 0,
                'trades': trades[-10:],  # 返回最近10笔交易
                'summary': f"策略在{days}天内进行了{len(sell_trades)}笔交易，胜率{win_rate:.1f}%，总收益{total_return:.2f}%"
            }

            # 缓存结果
            backtest_results[f"{symbol}_{strategy}_{days}"] = result

            return result

        else:
            raise HTTPException(status_code=400, detail="Unsupported strategy")

    except Exception as e:
        logger.error(f"Backtest error: {e}")
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
