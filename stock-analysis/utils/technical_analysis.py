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


def calculate_turnover_rate(data: pd.DataFrame, current_price: float) -> Dict[str, Any]:
    """计算换手率分析"""
    try:
        # 获取最近的成交量数据
        recent_volume = data['成交量'].tail(5).mean()
        current_volume = data['成交量'].iloc[-1]

        # 模拟流通股本（实际应该从基本面数据获取）
        # 这里基于股价估算一个合理的流通股本
        estimated_shares = recent_volume * 100 / (current_price * 0.05)  # 假设平均换手率5%

        # 计算换手率 = 成交量 / 流通股本 * 100%
        turnover_rate = (current_volume / estimated_shares) * 100

        # 换手率分析
        if turnover_rate < 3:
            activity_level = "低迷"
            market_sentiment = "观望"
            signal = "neutral"
        elif 3 <= turnover_rate <= 13:
            activity_level = "合理"
            market_sentiment = "正常"
            signal = "neutral"
        elif 13 < turnover_rate <= 25:
            activity_level = "活跃"
            market_sentiment = "积极"
            signal = "bullish"
        else:
            activity_level = "过热"
            market_sentiment = "投机"
            signal = "bearish"

        # 计算5日平均换手率
        volume_5d = data['成交量'].tail(5)
        turnover_5d_avg = (volume_5d.mean() / estimated_shares) * 100

        return {
            "turnover_rate": float(turnover_rate),
            "turnover_5d_avg": float(turnover_5d_avg),
            "activity_level": activity_level,
            "market_sentiment": market_sentiment,
            "signal": signal,
            "is_reasonable": 3 <= turnover_rate <= 13
        }
    except Exception as e:
        logger.error(f"Turnover Rate calculation error: {e}")
        return {
            "turnover_rate": 5.0,
            "turnover_5d_avg": 5.0,
            "activity_level": "合理",
            "market_sentiment": "正常",
            "signal": "neutral",
            "is_reasonable": True
        }


def calculate_elliott_wave(data: pd.DataFrame) -> Dict[str, Any]:
    """计算艾略特波浪理论分析"""
    try:
        close_prices = data['收盘'].values
        high_prices = data['最高'].values
        low_prices = data['最低'].values

        # 寻找波峰和波谷
        def find_peaks_and_troughs(prices, window=5):
            peaks = []
            troughs = []

            for i in range(window, len(prices) - window):
                # 波峰：比前后window个点都高
                if all(prices[i] >= prices[i-j] for j in range(1, window+1)) and \
                   all(prices[i] >= prices[i+j] for j in range(1, window+1)):
                    peaks.append((i, prices[i]))

                # 波谷：比前后window个点都低
                if all(prices[i] <= prices[i-j] for j in range(1, window+1)) and \
                   all(prices[i] <= prices[i+j] for j in range(1, window+1)):
                    troughs.append((i, prices[i]))

            return peaks, troughs

        peaks, troughs = find_peaks_and_troughs(close_prices)

        # 分析波浪结构
        def analyze_wave_structure(peaks, troughs):
            if len(peaks) < 3 or len(troughs) < 2:
                return "数据不足", "neutral", 1

            # 取最近的几个关键点
            recent_points = sorted(peaks[-3:] + troughs[-2:], key=lambda x: x[0])

            if len(recent_points) < 3:
                return "数据不足", "neutral", 1

            # 简化的波浪识别
            price_changes = [recent_points[i+1][1] - recent_points[i][1]
                           for i in range(len(recent_points)-1)]

            # 判断当前可能处于的波浪位置
            if len(price_changes) >= 4:
                # 检查是否符合5波上升或3波下降模式
                up_waves = sum(1 for change in price_changes if change > 0)
                down_waves = len(price_changes) - up_waves

                if up_waves >= 3:
                    current_wave = "第5浪"
                    trend = "bullish"
                    wave_position = 5
                elif down_waves >= 2:
                    current_wave = "调整浪C"
                    trend = "bearish"
                    wave_position = 3
                else:
                    current_wave = "第3浪"
                    trend = "bullish"
                    wave_position = 3
            else:
                current_wave = "第1浪"
                trend = "neutral"
                wave_position = 1

            return current_wave, trend, wave_position

        current_wave, wave_trend, wave_position = analyze_wave_structure(peaks, troughs)

        # 计算斐波那契回调位
        if len(close_prices) >= 20:
            recent_high = max(close_prices[-20:])
            recent_low = min(close_prices[-20:])
            price_range = recent_high - recent_low

            fib_levels = {
                "23.6%": recent_high - price_range * 0.236,
                "38.2%": recent_high - price_range * 0.382,
                "50.0%": recent_high - price_range * 0.5,
                "61.8%": recent_high - price_range * 0.618,
                "78.6%": recent_high - price_range * 0.786
            }
        else:
            current_price = close_prices[-1]
            fib_levels = {
                "23.6%": current_price * 0.95,
                "38.2%": current_price * 0.92,
                "50.0%": current_price * 0.90,
                "61.8%": current_price * 0.88,
                "78.6%": current_price * 0.85
            }

        # 波浪理论预测
        if wave_position == 5:
            prediction = "可能即将完成上升5浪，注意回调风险"
            confidence = "中等"
        elif wave_position == 3:
            if wave_trend == "bullish":
                prediction = "处于主升浪，可继续持有"
                confidence = "较高"
            else:
                prediction = "调整浪可能接近尾声"
                confidence = "中等"
        else:
            prediction = "波浪结构尚不明确，继续观察"
            confidence = "较低"

        return {
            "current_wave": current_wave,
            "wave_trend": wave_trend,
            "wave_position": wave_position,
            "fibonacci_levels": fib_levels,
            "prediction": prediction,
            "confidence": confidence,
            "peaks_count": len(peaks),
            "troughs_count": len(troughs)
        }

    except Exception as e:
        logger.error(f"Elliott Wave calculation error: {e}")
        return {
            "current_wave": "第1浪",
            "wave_trend": "neutral",
            "wave_position": 1,
            "fibonacci_levels": {
                "23.6%": 0,
                "38.2%": 0,
                "50.0%": 0,
                "61.8%": 0,
                "78.6%": 0
            },
            "prediction": "波浪分析暂不可用",
            "confidence": "无",
            "peaks_count": 0,
            "troughs_count": 0
        }
