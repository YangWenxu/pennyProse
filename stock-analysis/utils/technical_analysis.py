"""
技术分析工具函数
"""
import pandas as pd
import numpy as np
import talib
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


def calculate_macd(data: pd.DataFrame) -> Dict[str, Any]:
    """计算MACD指标"""
    try:
        close_prices = data['收盘'].values
        macd, signal, histogram = talib.MACD(close_prices)
        
        current_macd = macd[-1] if not np.isnan(macd[-1]) else 0
        current_signal = signal[-1] if not np.isnan(signal[-1]) else 0
        current_histogram = histogram[-1] if not np.isnan(histogram[-1]) else 0
        
        trend = "bullish" if current_histogram > 0 else "bearish"
        
        return {
            "macd": float(current_macd),
            "signal": float(current_signal),
            "histogram": float(current_histogram),
            "trend": trend
        }
    except Exception as e:
        logger.error(f"MACD calculation error: {e}")
        return {"macd": 0, "signal": 0, "histogram": 0, "trend": "neutral"}


def calculate_kdj(data: pd.DataFrame) -> Dict[str, Any]:
    """计算KDJ指标"""
    try:
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        close_prices = data['收盘'].values
        
        k, d = talib.STOCH(high_prices, low_prices, close_prices)
        j = 3 * k - 2 * d
        
        current_k = k[-1] if not np.isnan(k[-1]) else 50
        current_d = d[-1] if not np.isnan(d[-1]) else 50
        current_j = j[-1] if not np.isnan(j[-1]) else 50
        
        if current_k > 80:
            signal = "overbought"
        elif current_k < 20:
            signal = "oversold"
        else:
            signal = "neutral"
            
        return {
            "k": float(current_k),
            "d": float(current_d),
            "j": float(current_j),
            "signal": signal,
            "overbought": current_k > 80,
            "oversold": current_k < 20
        }
    except Exception as e:
        logger.error(f"KDJ calculation error: {e}")
        return {"k": 50, "d": 50, "j": 50, "signal": "neutral", "overbought": False, "oversold": False}


def calculate_rsi(data: pd.DataFrame) -> Dict[str, Any]:
    """计算RSI指标"""
    try:
        close_prices = data['收盘'].values
        rsi = talib.RSI(close_prices)
        current_rsi = rsi[-1] if not np.isnan(rsi[-1]) else 50
        
        if current_rsi > 70:
            signal = "overbought"
        elif current_rsi < 30:
            signal = "oversold"
        else:
            signal = "neutral"
            
        return {
            "rsi": float(current_rsi),
            "signal": signal,
            "overbought": current_rsi > 70,
            "oversold": current_rsi < 30
        }
    except Exception as e:
        logger.error(f"RSI calculation error: {e}")
        return {"rsi": 50, "signal": "neutral", "overbought": False, "oversold": False}


def calculate_bollinger_bands(data: pd.DataFrame) -> Dict[str, Any]:
    """计算布林带指标"""
    try:
        close_prices = data['收盘'].values
        upper, middle, lower = talib.BBANDS(close_prices)
        
        current_price = close_prices[-1]
        current_upper = upper[-1] if not np.isnan(upper[-1]) else current_price * 1.02
        current_middle = middle[-1] if not np.isnan(middle[-1]) else current_price
        current_lower = lower[-1] if not np.isnan(lower[-1]) else current_price * 0.98
        
        if current_price > current_upper:
            position = "upper"
        elif current_price < current_lower:
            position = "lower"
        else:
            position = "middle"
            
        # 判断布林带收窄
        band_width = (current_upper - current_lower) / current_middle
        squeeze = band_width < 0.1
        
        return {
            "upper": float(current_upper),
            "middle": float(current_middle),
            "lower": float(current_lower),
            "position": position,
            "squeeze": squeeze
        }
    except Exception as e:
        logger.error(f"Bollinger Bands calculation error: {e}")
        current_price = data['收盘'].iloc[-1]
        return {
            "upper": float(current_price * 1.02),
            "middle": float(current_price),
            "lower": float(current_price * 0.98),
            "position": "middle",
            "squeeze": False
        }


def calculate_williams_r(data: pd.DataFrame) -> Dict[str, Any]:
    """计算威廉指标"""
    try:
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        close_prices = data['收盘'].values
        
        wr = talib.WILLR(high_prices, low_prices, close_prices)
        current_wr = wr[-1] if not np.isnan(wr[-1]) else -50
        
        if current_wr > -20:
            signal = "overbought"
        elif current_wr < -80:
            signal = "oversold"
        else:
            signal = "neutral"
            
        return {
            "wr": float(current_wr),
            "signal": signal,
            "overbought": current_wr > -20,
            "oversold": current_wr < -80
        }
    except Exception as e:
        logger.error(f"Williams %R calculation error: {e}")
        return {"wr": -50, "signal": "neutral", "overbought": False, "oversold": False}


def calculate_gann_lines(data: pd.DataFrame) -> Dict[str, Any]:
    """计算江恩线"""
    try:
        close_prices = data['收盘'].values
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        
        recent_high = np.max(high_prices[-20:])
        recent_low = np.min(low_prices[-20:])
        current_price = close_prices[-1]
        
        # 简化的江恩线计算
        price_range = recent_high - recent_low
        time_range = 20
        
        gann_1x1 = recent_low + (price_range / time_range) * time_range
        gann_2x1 = recent_low + (price_range / time_range) * (time_range / 2)
        gann_1x2 = recent_low + (price_range / time_range) * (time_range * 2)
        
        # 趋势判断
        if current_price > gann_1x1:
            trend = "bullish"
        elif current_price < gann_1x1:
            trend = "bearish"
        else:
            trend = "neutral"
            
        # 角度计算
        angle = np.arctan(price_range / time_range)
        
        return {
            "gann_1x1": float(gann_1x1),
            "gann_2x1": float(gann_2x1),
            "gann_1x2": float(gann_1x2),
            "trend": trend,
            "angle": float(angle),
            "recent_high": float(recent_high),
            "recent_low": float(recent_low),
            "support_level": float(recent_low),
            "resistance_level": float(recent_high)
        }
    except Exception as e:
        logger.error(f"Gann Lines calculation error: {e}")
        current_price = data['收盘'].iloc[-1]
        return {
            "gann_1x1": float(current_price),
            "gann_2x1": float(current_price),
            "gann_1x2": float(current_price),
            "trend": "neutral",
            "angle": 0.0,
            "recent_high": float(current_price * 1.05),
            "recent_low": float(current_price * 0.95),
            "support_level": float(current_price * 0.95),
            "resistance_level": float(current_price * 1.05)
        }


def calculate_moving_averages(data: pd.DataFrame) -> Dict[str, Any]:
    """计算移动平均线"""
    try:
        close_prices = data['收盘'].values
        
        ma5 = talib.SMA(close_prices, timeperiod=5)
        ma10 = talib.SMA(close_prices, timeperiod=10)
        ma20 = talib.SMA(close_prices, timeperiod=20)
        ma60 = talib.SMA(close_prices, timeperiod=60)
        
        current_ma5 = ma5[-1] if not np.isnan(ma5[-1]) else close_prices[-1]
        current_ma10 = ma10[-1] if not np.isnan(ma10[-1]) else close_prices[-1]
        current_ma20 = ma20[-1] if not np.isnan(ma20[-1]) else close_prices[-1]
        current_ma60 = ma60[-1] if not np.isnan(ma60[-1]) else close_prices[-1]
        current_price = close_prices[-1]
        
        # 多头排列判断
        bullish_alignment = current_ma5 > current_ma10 > current_ma20 > current_ma60
        
        # 金叉死叉判断
        if len(ma5) > 1 and len(ma10) > 1:
            prev_ma5 = ma5[-2] if not np.isnan(ma5[-2]) else current_ma5
            prev_ma10 = ma10[-2] if not np.isnan(ma10[-2]) else current_ma10
            
            if prev_ma5 <= prev_ma10 and current_ma5 > current_ma10:
                cross_signal = "golden_cross"
            elif prev_ma5 >= prev_ma10 and current_ma5 < current_ma10:
                cross_signal = "death_cross"
            else:
                cross_signal = "neutral"
        else:
            cross_signal = "neutral"
        
        return {
            "ma5": float(current_ma5),
            "ma10": float(current_ma10),
            "ma20": float(current_ma20),
            "ma60": float(current_ma60),
            "bullish_alignment": bullish_alignment,
            "cross_signal": cross_signal,
            "above_ma20": current_price > current_ma20
        }
    except Exception as e:
        logger.error(f"Moving Averages calculation error: {e}")
        current_price = data['收盘'].iloc[-1]
        return {
            "ma5": float(current_price),
            "ma10": float(current_price),
            "ma20": float(current_price),
            "ma60": float(current_price),
            "bullish_alignment": False,
            "cross_signal": "neutral",
            "above_ma20": True
        }


def calculate_volume_analysis(data: pd.DataFrame) -> Dict[str, Any]:
    """计算量能分析"""
    try:
        volume = data['成交量'].values
        close_prices = data['收盘'].values
        
        current_volume = volume[-1]
        volume_ma5 = np.mean(volume[-5:]) if len(volume) >= 5 else current_volume
        volume_ma10 = np.mean(volume[-10:]) if len(volume) >= 10 else current_volume
        
        volume_ratio = current_volume / volume_ma5 if volume_ma5 > 0 else 1
        
        # 量价关系分析
        if len(close_prices) > 1:
            price_change = (close_prices[-1] - close_prices[-2]) / close_prices[-2]
            if price_change > 0 and volume_ratio > 1.5:
                volume_price_signal = "bullish"
            elif price_change < 0 and volume_ratio > 1.5:
                volume_price_signal = "bearish"
            else:
                volume_price_signal = "neutral"
        else:
            volume_price_signal = "neutral"
        
        return {
            "current_volume": float(current_volume),
            "volume_ma5": float(volume_ma5),
            "volume_ma10": float(volume_ma10),
            "volume_ratio": float(volume_ratio),
            "volume_price_signal": volume_price_signal
        }
    except Exception as e:
        logger.error(f"Volume Analysis calculation error: {e}")
        return {
            "current_volume": 1000000.0,
            "volume_ma5": 1000000.0,
            "volume_ma10": 1000000.0,
            "volume_ratio": 1.0,
            "volume_price_signal": "neutral"
        }
