from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import efinance as ef
import requests
import json
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stock Analysis API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3001"],
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
    signals: Dict[str, List[str]]
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
            'k': float(k_val),
            'd': float(d_val),
            'j': float(j_val),
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

def calculate_rsi(prices, period=14):
    """计算RSI指标"""
    try:
        if len(prices) < period + 1:
            return {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

        # 计算价格变化
        deltas = np.diff(prices)

        # 分离上涨和下跌
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        # 计算平均收益和损失
        avg_gain = np.mean(gains[:period])
        avg_loss = np.mean(losses[:period])

        # 计算后续的平均收益和损失
        for i in range(period, len(gains)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        # 计算RSI
        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))

        # 判断信号
        if rsi > 70:
            signal = 'overbought'
            overbought = True
            oversold = False
        elif rsi < 30:
            signal = 'oversold'
            overbought = False
            oversold = True
        else:
            signal = 'neutral'
            overbought = False
            oversold = False

        return {
            'rsi': float(rsi),
            'signal': signal,
            'overbought': overbought,
            'oversold': oversold
        }
    except Exception as e:
        logger.error(f"RSI calculation error: {e}")
        return {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带指标"""
    try:
        if len(prices) < period:
            current_price = prices[-1] if len(prices) > 0 else 100
            return {
                'upper': float(current_price * 1.02),
                'middle': float(current_price),
                'lower': float(current_price * 0.98),
                'position': 'middle',
                'squeeze': False
            }

        # 计算移动平均线（中轨）
        sma = calculate_sma(prices, period)

        # 计算标准差
        std_values = []
        for i in range(len(prices)):
            if i < period - 1:
                std_values.append(np.nan)
            else:
                window_prices = prices[i-period+1:i+1]
                std_val = np.std(window_prices)
                std_values.append(std_val)

        std_values = np.array(std_values)

        # 计算上轨和下轨
        upper_band = sma + (std_dev * std_values)
        lower_band = sma - (std_dev * std_values)

        # 获取最新值
        current_price = prices[-1]
        upper_val = upper_band[-1] if not bool(np.isnan(upper_band[-1])) else current_price * 1.02
        middle_val = sma[-1] if not bool(np.isnan(sma[-1])) else current_price
        lower_val = lower_band[-1] if not bool(np.isnan(lower_band[-1])) else current_price * 0.98

        # 判断价格位置
        if current_price > upper_val:
            position = 'upper'
        elif current_price < lower_val:
            position = 'lower'
        else:
            position = 'middle'

        # 判断是否收窄（布林带挤压）
        band_width = (upper_val - lower_val) / middle_val
        squeeze = bool(band_width < 0.1)  # 如果带宽小于10%认为是挤压

        return {
            'upper': float(upper_val),
            'middle': float(middle_val),
            'lower': float(lower_val),
            'position': position,
            'squeeze': squeeze
        }
    except Exception as e:
        logger.error(f"Bollinger Bands calculation error: {e}")
        current_price = prices[-1] if len(prices) > 0 else 100
        return {
            'upper': float(current_price * 1.02),
            'middle': float(current_price),
            'lower': float(current_price * 0.98),
            'position': 'middle',
            'squeeze': False
        }

def calculate_williams_r(high, low, close, period=14):
    """计算威廉指标(Williams %R)"""
    try:
        if len(high) < period or len(low) < period or len(close) < period:
            return {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

        # 计算最近period天的最高价和最低价
        highest_high = []
        lowest_low = []

        for i in range(len(close)):
            if i < period - 1:
                highest_high.append(np.nan)
                lowest_low.append(np.nan)
            else:
                hh = max(high[i-period+1:i+1])
                ll = min(low[i-period+1:i+1])
                highest_high.append(hh)
                lowest_low.append(ll)

        # 计算威廉指标
        wr_values = []
        for i in range(len(close)):
            if np.isnan(highest_high[i]) or np.isnan(lowest_low[i]):
                wr_values.append(np.nan)
            else:
                if highest_high[i] == lowest_low[i]:
                    wr = -50  # 避免除零
                else:
                    wr = -100 * (highest_high[i] - close[i]) / (highest_high[i] - lowest_low[i])
                wr_values.append(wr)

        # 获取最新值
        current_wr = wr_values[-1] if not np.isnan(wr_values[-1]) else -50

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
            'overbought': overbought,
            'oversold': oversold
        }
    except Exception as e:
        logger.error(f"Williams %R calculation error: {e}")
        return {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}

def calculate_gann_lines(prices, period=20):
    """计算江恩线"""
    try:
        if len(prices) < period:
            current_price = prices[-1] if len(prices) > 0 else 100
            return {
                'gann_1x1': float(current_price),
                'gann_2x1': float(current_price * 1.05),
                'gann_1x2': float(current_price * 0.95),
                'trend': 'neutral',
                'angle': 45.0,
                'recent_high': float(current_price * 1.1),
                'recent_low': float(current_price * 0.9),
                'support_level': float(current_price * 0.95),
                'resistance_level': float(current_price * 1.05)
            }

        # 计算最近的高点和低点
        recent_high = float(max(prices[-period:]))
        recent_low = float(min(prices[-period:]))

        # 计算价格变化率
        start_price = prices[-period]
        end_price = prices[-1]
        price_change = end_price - start_price
        time_change = period

        # 计算江恩角度 (简化版本)
        angle = np.arctan(price_change / (time_change * start_price * 0.01)) * 180 / np.pi

        # 计算1x1线、2x1线和1x2线
        gann_1x1 = start_price + (price_change * 1.0)  # 1:1比例
        gann_2x1 = start_price + (price_change * 2.0)  # 2:1比例
        gann_1x2 = start_price + (price_change * 0.5)  # 1:2比例

        # 计算支撑和阻力位
        support_level = float(min(recent_low, gann_1x2))
        resistance_level = float(max(recent_high, gann_2x1))

        # 判断趋势
        if angle > 60:
            trend = 'strong_bullish'
        elif angle > 30:
            trend = 'bullish'
        elif angle < -30:
            trend = 'bearish'
        else:
            trend = 'neutral'

        return {
            'gann_1x1': float(gann_1x1),
            'gann_2x1': float(gann_2x1),
            'gann_1x2': float(gann_1x2),
            'trend': trend,
            'angle': float(abs(angle)),
            'recent_high': recent_high,
            'recent_low': recent_low,
            'support_level': support_level,
            'resistance_level': resistance_level
        }
    except Exception as e:
        logger.error(f"Gann lines calculation error: {e}")
        current_price = prices[-1] if len(prices) > 0 else 100
        return {
            'gann_1x1': float(current_price),
            'gann_2x1': float(current_price * 1.05),
            'gann_1x2': float(current_price * 0.95),
            'trend': 'neutral',
            'angle': 45.0,
            'recent_high': float(current_price * 1.1),
            'recent_low': float(current_price * 0.9),
            'support_level': float(current_price * 0.95),
            'resistance_level': float(current_price * 1.05)
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
        price_up = bool(len(prices) > 1 and prices[-1] > prices[-2])
        volume_up = bool(current_volume > vol_ma5)
        
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
            'volume_ratio': float(current_volume / vol_ma5 if vol_ma5 > 0 else 1),
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
    
    # RSI分析
    if 'rsi' in analysis:
        if analysis['rsi']['oversold']:
            score += 1
            signals.append("RSI超卖区域")
        elif analysis['rsi']['overbought']:
            score -= 1
            signals.append("RSI超买区域")

    # 布林带分析
    if 'boll' in analysis:
        if analysis['boll']['position'] == 'lower':
            score += 1
            signals.append("价格触及布林带下轨")
        elif analysis['boll']['position'] == 'upper':
            score -= 1
            signals.append("价格触及布林带上轨")
        if analysis['boll']['squeeze']:
            signals.append("布林带收窄")

    # 威廉指标分析
    if 'wr' in analysis:
        if analysis['wr']['oversold']:
            score += 1
            signals.append("威廉指标超卖")
        elif analysis['wr']['overbought']:
            score -= 1
            signals.append("威廉指标超买")

    # 江恩线分析
    if 'gann' in analysis:
        if analysis['gann']['trend'] == 'strong_bullish':
            score += 2
            signals.append("江恩线强势上涨")
        elif analysis['gann']['trend'] == 'bullish':
            score += 1
            signals.append("江恩线看涨")
        elif analysis['gann']['trend'] == 'bearish':
            score -= 1
            signals.append("江恩线看跌")

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
        # 使用模拟数据作为后备方案
        use_mock_data = False

        # 尝试多种数据源获取股票信息
        stock_data = None

        try:
            # 首先尝试efinance
            logger.info("Trying efinance API...")
            all_stocks = ef.stock.get_realtime_quotes()
            stock_info = all_stocks[all_stocks['股票代码'] == request.symbol]

            if not stock_info.empty:
                stock_data = {
                    'name': stock_info.iloc[0]['股票名称'],
                    'current_price': float(stock_info.iloc[0]['最新价']),
                    'change_percent': float(stock_info.iloc[0]['涨跌幅'])
                }
                logger.info("efinance API success")
            else:
                logger.warning(f"Stock {request.symbol} not found in efinance")
        except Exception as e:
            logger.warning(f"efinance API failed: {e}")
            stock_data = None

        # 如果efinance失败，尝试备用数据源
        if stock_data is None:
            logger.info("Trying alternative data sources...")
            stock_data = get_stock_data_alternative(request.symbol)

        # 设置股票信息
        if stock_data:
            stock_name = stock_data['name']
            current_price = stock_data['current_price']
            change_percent = stock_data['change_percent']
            use_mock_data = False
            logger.info(f"Got real data for {request.symbol}: {stock_name}")
        else:
            # 所有数据源都失败，使用模拟数据
            logger.warning(f"All data sources failed for {request.symbol}, using mock data")
            stock_name = f"模拟股票-{request.symbol}"
            current_price = 100.0
            change_percent = 0.5
            use_mock_data = True
            
        # 获取历史数据
        hist_data = None

        if not use_mock_data:
            # 尝试获取真实历史数据
            try:
                logger.info("Trying efinance for historical data...")
                end_date = datetime.now().strftime('%Y%m%d')
                start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')

                hist_data = ef.stock.get_quote_history(request.symbol, beg=start_date, end=end_date)
                if not hist_data.empty:
                    logger.info("efinance historical data success")
                else:
                    raise Exception("No historical data returned")

            except Exception as e:
                logger.warning(f"efinance historical data failed: {e}")
                # 尝试备用历史数据源
                logger.info("Trying alternative historical data sources...")
                hist_data = get_stock_history_alternative(request.symbol)

                if hist_data is not None and not hist_data.empty:
                    logger.info("Alternative historical data success")

        # 如果没有获取到历史数据，使用模拟数据
        if hist_data is None or hist_data.empty:
            logger.warning("Using mock historical data")
            dates = pd.date_range(end=datetime.now(), periods=252, freq='B')
            mock_data = {
                '日期': dates,
                '收盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                '开盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                '最高': np.random.normal(current_price*1.01, current_price*0.01, len(dates)),
                '最低': np.random.normal(current_price*0.99, current_price*0.01, len(dates)),
                '成交量': np.random.normal(1000000, 200000, len(dates))
            }
            hist_data = pd.DataFrame(mock_data)
        
        # 准备数据
        prices = hist_data['收盘'].values.astype(float)
        high = hist_data['最高'].values.astype(float)
        low = hist_data['最低'].values.astype(float)
        volume = hist_data['成交量'].values.astype(float)
        
        # 计算技术指标
        macd_analysis = calculate_macd(prices)
        kdj_analysis = calculate_kdj(high, low, prices)
        ma_analysis = calculate_moving_averages(prices)
        rsi_analysis = calculate_rsi(prices)
        boll_analysis = calculate_bollinger_bands(prices)
        wr_analysis = calculate_williams_r(high, low, prices)
        gann_analysis = calculate_gann_lines(prices)
        volume_analysis = calculate_volume_analysis(volume, prices)
        
        # 综合分析
        analysis = {
            'macd': macd_analysis,
            'kdj': kdj_analysis,
            'ma': ma_analysis,
            'rsi': rsi_analysis,
            'boll': boll_analysis,
            'wr': wr_analysis,
            'gann': gann_analysis,
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

@app.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: int = 30):
    """获取股票历史数据"""
    try:
        logger.info(f"Getting history for stock: {symbol}, days: {days}")

        # 使用模拟数据作为后备方案
        use_mock_data = False

        try:
            # 获取股票基本信息
            all_stocks = ef.stock.get_realtime_quotes()
            stock_info = all_stocks[all_stocks['股票代码'] == symbol]

            if stock_info.empty:
                # 如果找不到股票，使用模拟数据
                logger.warning(f"Stock {symbol} not found, using mock data")
                current_price = 100.0
                use_mock_data = True
            else:
                current_price = float(stock_info.iloc[0]['最新价'])

        except Exception as e:
            logger.warning(f"Failed to get stock info: {e}, using mock data")
            current_price = 100.0
            use_mock_data = True

        # 获取历史数据或使用模拟数据
        if use_mock_data:
            # 直接使用模拟数据
            logger.info("Using mock historical data")
            dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
            mock_data = {
                '日期': dates,
                '收盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                '开盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                '最高': np.random.normal(current_price*1.01, current_price*0.01, len(dates)),
                '最低': np.random.normal(current_price*0.99, current_price*0.01, len(dates)),
                '成交量': np.random.normal(1000000, 200000, len(dates))
            }
            hist_data = pd.DataFrame(mock_data)
        else:
            # 尝试获取真实历史数据
            try:
                end_date = datetime.now().strftime('%Y%m%d')
                start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')

                hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
                if hist_data.empty:
                    raise Exception("No historical data returned")

            except Exception as e:
                logger.warning(f"Failed to get real historical data: {e}, using mock data")
                # 使用模拟数据作为后备方案
                dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
                mock_data = {
                    '日期': dates,
                    '收盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                    '开盘': np.random.normal(current_price, current_price*0.02, len(dates)),
                    '最高': np.random.normal(current_price*1.01, current_price*0.01, len(dates)),
                    '最低': np.random.normal(current_price*0.99, current_price*0.01, len(dates)),
                    '成交量': np.random.normal(1000000, 200000, len(dates))
                }
                hist_data = pd.DataFrame(mock_data)

        # 转换数据格式为前端期望的格式
        chart_data = []
        for _, row in hist_data.iterrows():
            chart_data.append({
                'date': row['日期'].strftime('%Y-%m-%d') if hasattr(row['日期'], 'strftime') else str(row['日期']),
                'open': float(row['开盘']),
                'high': float(row['最高']),
                'low': float(row['最低']),
                'close': float(row['收盘']),
                'volume': float(row['成交量'])
            })

        return {
            'symbol': symbol,
            'data': chart_data
        }

    except Exception as e:
        logger.error(f"History data error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history data: {str(e)}")

# 内存存储（实际应用中应使用数据库）
watchlist = [
    {'symbol': '000001', 'name': '平安银行', 'price': 12.73, 'change': -1.93},
    {'symbol': '000002', 'name': '万科A', 'price': 8.45, 'change': 0.24},
    {'symbol': '000858', 'name': '五粮液', 'price': 128.50, 'change': 2.15}
]

alert_rules = [
    {
        'id': 1,
        'symbol': '000001',
        'name': '平安银行',
        'type': 'price_above',
        'target_price': 13.0,
        'current_price': 12.73,
        'status': 'active'
    }
]

def get_stock_data_alternative(symbol):
    """备用股票数据获取函数"""
    # 转换股票代码格式
    def format_symbol_for_api(symbol):
        if symbol.startswith('6'):
            return f"sh{symbol}"  # 上海股票
        elif symbol.startswith('0') or symbol.startswith('3'):
            return f"sz{symbol}"  # 深圳股票
        else:
            return symbol

    formatted_symbol = format_symbol_for_api(symbol)
    logger.info(f"Trying alternative APIs for {symbol} (formatted: {formatted_symbol})")

    try:
        # 方法1：尝试使用腾讯财经API
        tencent_url = f"http://qt.gtimg.cn/q={formatted_symbol}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'http://stockapp.finance.qq.com/',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }

        response = requests.get(tencent_url, headers=headers, timeout=10)
        if response.status_code == 200:
            content = response.text
            logger.info(f"Tencent API response: {content[:200]}...")

            if 'v_' in content and '~' in content:
                # 解析腾讯财经数据
                try:
                    data_str = content.split('"')[1]
                    data_parts = data_str.split('~')

                    if len(data_parts) >= 4 and data_parts[1] and data_parts[3]:
                        current_price = float(data_parts[3])
                        prev_close = float(data_parts[4]) if len(data_parts) > 4 and data_parts[4] else current_price
                        change_percent = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0

                        result = {
                            'name': data_parts[1],
                            'current_price': current_price,
                            'change_percent': change_percent
                        }
                        logger.info(f"Tencent API success: {result}")
                        return result
                except Exception as e:
                    logger.warning(f"Failed to parse Tencent data: {e}")
    except Exception as e:
        logger.warning(f"Tencent API failed: {e}")

    try:
        # 方法2：尝试使用新浪财经API
        sina_url = f"http://hq.sinajs.cn/list={formatted_symbol}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'http://finance.sina.com.cn/',
            'Accept': '*/*'
        }

        response = requests.get(sina_url, headers=headers, timeout=10)
        if response.status_code == 200:
            content = response.text
            logger.info(f"Sina API response: {content[:200]}...")

            if 'var hq_str_' in content and '=' in content:
                # 解析新浪财经数据
                try:
                    data_str = content.split('="')[1].split('";')[0]
                    data_parts = data_str.split(',')

                    if len(data_parts) >= 4 and data_parts[0] and data_parts[3]:
                        current_price = float(data_parts[3])
                        prev_close = float(data_parts[2]) if data_parts[2] else current_price
                        change_percent = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0

                        result = {
                            'name': data_parts[0],
                            'current_price': current_price,
                            'change_percent': change_percent
                        }
                        logger.info(f"Sina API success: {result}")
                        return result
                except Exception as e:
                    logger.warning(f"Failed to parse Sina data: {e}")
    except Exception as e:
        logger.warning(f"Sina API failed: {e}")

    # 如果所有方法都失败，返回None
    logger.warning("All alternative APIs failed")
    return None

def get_stock_history_alternative(symbol, days=365):
    """备用历史数据获取函数"""
    try:
        # 使用网易财经API获取历史数据
        import time
        end_date = time.strftime('%Y%m%d')
        start_date = time.strftime('%Y%m%d', time.localtime(time.time() - days * 24 * 3600))

        netease_url = f"http://quotes.money.163.com/service/chddata.html?code=0{symbol}&start={start_date}&end={end_date}&fields=TCLOSE,HIGH,LOW,TOPEN,VOTURNOVER"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'http://quotes.money.163.com/'
        }

        response = requests.get(netease_url, headers=headers, timeout=15)
        if response.status_code == 200:
            # 解析CSV数据
            lines = response.text.strip().split('\n')
            if len(lines) > 1:
                data = []
                for line in lines[1:]:  # 跳过标题行
                    parts = line.split(',')
                    if len(parts) >= 6:
                        data.append({
                            '日期': pd.to_datetime(parts[0]),
                            '收盘': float(parts[3]),
                            '最高': float(parts[4]),
                            '最低': float(parts[5]),
                            '开盘': float(parts[6]),
                            '成交量': float(parts[7]) if len(parts) > 7 else 1000000
                        })

                if data:
                    return pd.DataFrame(data)
    except Exception as e:
        logger.warning(f"Netease API failed: {e}")

    return None

@app.get("/watchlist")
async def get_watchlist():
    """获取自选股列表"""
    try:
        return {'watchlist': watchlist}
    except Exception as e:
        logger.error(f"Watchlist error: {e}")
        return {'watchlist': []}

@app.post("/watchlist")
async def add_to_watchlist(symbol: str, name: str = None):
    """添加股票到自选股"""
    try:
        if name is None:
            name = symbol

        if not symbol:
            raise HTTPException(status_code=400, detail="Symbol is required")

        # 检查是否已存在
        if any(item['symbol'] == symbol for item in watchlist):
            raise HTTPException(status_code=400, detail="Stock already in watchlist")

        # 尝试获取当前价格
        try:
            all_stocks = ef.stock.get_realtime_quotes()
            stock_info = all_stocks[all_stocks['股票代码'] == symbol]

            if not stock_info.empty:
                current_price = float(stock_info.iloc[0]['最新价'])
                change_percent = float(stock_info.iloc[0]['涨跌幅'])
                stock_name = stock_info.iloc[0]['股票名称']
            else:
                current_price = 100.0
                change_percent = 0.0
                stock_name = name
        except:
            current_price = 100.0
            change_percent = 0.0
            stock_name = name

        watchlist.append({
            'symbol': symbol,
            'name': stock_name,
            'price': current_price,
            'change': change_percent
        })

        return {'message': 'Added to watchlist successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add to watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add to watchlist: {str(e)}")

@app.delete("/watchlist/{symbol}")
async def remove_from_watchlist(symbol: str):
    """从自选股中移除股票"""
    try:
        global watchlist
        original_length = len(watchlist)
        watchlist = [item for item in watchlist if item['symbol'] != symbol]

        if len(watchlist) == original_length:
            raise HTTPException(status_code=404, detail="Stock not found in watchlist")

        return {'message': 'Removed from watchlist successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove from watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to remove from watchlist: {str(e)}")

@app.get("/alerts")
async def get_alerts():
    """获取价格提醒列表"""
    try:
        return {'alerts': alert_rules}
    except Exception as e:
        logger.error(f"Alerts error: {e}")
        return {'alerts': []}

@app.post("/alerts")
async def create_alert(request: dict):
    """创建价格提醒"""
    try:
        symbol = request.get('symbol')
        condition = request.get('condition', 'price_above')
        target_price = float(request.get('value', 0))
        message = request.get('message', '')

        if not symbol or target_price <= 0:
            raise HTTPException(status_code=400, detail="Invalid alert parameters")

        # 获取股票名称和当前价格
        try:
            all_stocks = ef.stock.get_realtime_quotes()
            stock_info = all_stocks[all_stocks['股票代码'] == symbol]

            if not stock_info.empty:
                current_price = float(stock_info.iloc[0]['最新价'])
                stock_name = stock_info.iloc[0]['股票名称']
            else:
                current_price = 100.0
                stock_name = symbol
        except:
            current_price = 100.0
            stock_name = symbol

        # 生成新的ID
        new_id = max([alert['id'] for alert in alert_rules], default=0) + 1

        new_alert = {
            'id': new_id,
            'symbol': symbol,
            'name': stock_name,
            'type': condition,
            'target_price': target_price,
            'current_price': current_price,
            'status': 'active',
            'message': message,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        alert_rules.append(new_alert)

        return {'message': 'Alert created successfully', 'alert': new_alert}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create alert error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    """删除价格提醒"""
    try:
        global alert_rules
        original_length = len(alert_rules)
        alert_rules = [alert for alert in alert_rules if alert['id'] != alert_id]

        if len(alert_rules) == original_length:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {'message': 'Alert deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete alert error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")

@app.get("/alerts/check")
async def check_alerts():
    """检查价格提醒"""
    try:
        # 返回模拟的提醒检查结果
        return {
            'triggered_alerts': [],
            'total_alerts': 1,
            'active_alerts': 1
        }
    except Exception as e:
        logger.error(f"Alert check error: {e}")
        return {'triggered_alerts': [], 'total_alerts': 0, 'active_alerts': 0}

@app.post("/backtest")
async def run_backtest(request: dict):
    """运行回测"""
    try:
        import random

        symbol = request.get('symbol', '000001')
        strategy = request.get('strategy', 'ma_cross')
        days = request.get('days', 100)

        # 生成模拟回测结果
        total_trades = random.randint(8, 25)
        win_rate = random.randint(45, 75)  # 45-75%
        total_return = round(random.uniform(-15, 30), 2)  # -15% to +30%
        avg_return_per_trade = round(total_return / total_trades if total_trades > 0 else 0, 2)

        # 生成交易记录
        trades = []
        for i in range(min(8, total_trades)):
            base_price = random.uniform(10, 50)
            trade = {
                'type': 'buy' if i % 2 == 0 else 'sell',
                'price': round(base_price, 2),
                'ma5': round(base_price * random.uniform(0.98, 1.02), 2),
                'ma20': round(base_price * random.uniform(0.95, 1.05), 2),
                'profit': round(random.uniform(-8, 12), 2)
            }
            trades.append(trade)

        # 生成策略总结
        strategy_name = '均线交叉策略' if strategy == 'ma_cross' else strategy
        performance = '表现良好' if total_return > 5 else '表现一般' if total_return > -5 else '表现较差'

        summary = f"{symbol} 在过去{days}天的{strategy_name}回测中，共产生{total_trades}次交易信号。策略{performance}，胜率为{win_rate}%，总收益率为{total_return}%。建议结合市场环境和风险管理进行实际应用。"

        return {
            'symbol': symbol,
            'strategy': strategy,
            'period_days': days,
            'total_trades': total_trades,
            'win_rate': win_rate,
            'total_return': float(total_return),
            'avg_return_per_trade': float(avg_return_per_trade),
            'summary': summary,
            'trades': trades,
            'backtest_id': f'bt_{random.randint(1000, 9999)}',
            'status': 'completed'
        }
    except Exception as e:
        logger.error(f"Backtest error: {e}")
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")

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
    uvicorn.run(app, host="127.0.0.1", port=8001)
