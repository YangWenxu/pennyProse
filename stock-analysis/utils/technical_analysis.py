"""
技术分析工具函数
"""
import pandas as pd
import numpy as np
from typing import Dict, Any
import logging

# 尝试导入talib，如果失败则使用替代实现
try:
    import talib
    HAS_TALIB = True
except ImportError:
    HAS_TALIB = False
    print("Warning: talib not available, using simplified implementations")

logger = logging.getLogger(__name__)


def calculate_ema(data: pd.Series, period: int) -> pd.Series:
    """计算指数移动平均线"""
    return data.ewm(span=period).mean()

def calculate_macd(data: pd.DataFrame) -> Dict[str, Any]:
    """计算MACD指标"""
    try:
        close_prices = data['收盘']

        if HAS_TALIB:
            # 使用talib计算
            macd, signal, histogram = talib.MACD(close_prices.values)
            current_macd = macd[-1] if not np.isnan(macd[-1]) else 0
            current_signal = signal[-1] if not np.isnan(signal[-1]) else 0
        else:
            # 使用pandas计算MACD
            ema12 = calculate_ema(close_prices, 12)
            ema26 = calculate_ema(close_prices, 26)
            macd_line = ema12 - ema26
            signal_line = calculate_ema(macd_line, 9)

            current_macd = macd_line.iloc[-1] if len(macd_line) > 0 else 0
            current_signal = signal_line.iloc[-1] if len(signal_line) > 0 else 0
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
        if HAS_TALIB:
            high_prices = data['最高'].values
            low_prices = data['最低'].values
            close_prices = data['收盘'].values

            k, d = talib.STOCH(high_prices, low_prices, close_prices)
            j = 3 * k - 2 * d

            current_k = k[-1] if not np.isnan(k[-1]) else 50
            current_d = d[-1] if not np.isnan(d[-1]) else 50
            current_j = j[-1] if not np.isnan(j[-1]) else 50
        else:
            # 简化的KDJ计算
            high_prices = data['最高']
            low_prices = data['最低']
            close_prices = data['收盘']

            # 计算RSV
            period = 9
            if len(data) >= period:
                rsv = (close_prices.iloc[-1] - low_prices.rolling(period).min().iloc[-1]) / \
                      (high_prices.rolling(period).max().iloc[-1] - low_prices.rolling(period).min().iloc[-1]) * 100
            else:
                rsv = 50

            # 简化的K、D、J值
            current_k = rsv * 0.6 + 50 * 0.4  # 简化计算
            current_d = current_k * 0.6 + 50 * 0.4
            current_j = 3 * current_k - 2 * current_d
        
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
        close_prices = data['收盘']

        if HAS_TALIB:
            rsi = talib.RSI(close_prices.values)
            current_rsi = rsi[-1] if not np.isnan(rsi[-1]) else 50
        else:
            # 简化的RSI计算
            period = 14
            if len(close_prices) >= period:
                delta = close_prices.diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
                rs = gain / loss
                rsi = 100 - (100 / (1 + rs))
                current_rsi = rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50
            else:
                current_rsi = 50
        
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
        close_prices = data['收盘']
        current_price = close_prices.iloc[-1]

        if HAS_TALIB:
            upper, middle, lower = talib.BBANDS(close_prices.values)
            current_upper = upper[-1] if not np.isnan(upper[-1]) else current_price * 1.02
            current_middle = middle[-1] if not np.isnan(middle[-1]) else current_price
            current_lower = lower[-1] if not np.isnan(lower[-1]) else current_price * 0.98
        else:
            # 简化的布林带计算
            period = 20
            if len(close_prices) >= period:
                sma = close_prices.rolling(window=period).mean()
                std = close_prices.rolling(window=period).std()
                current_middle = sma.iloc[-1]
                current_upper = current_middle + (std.iloc[-1] * 2)
                current_lower = current_middle - (std.iloc[-1] * 2)
            else:
                current_middle = current_price
                current_upper = current_price * 1.02
                current_lower = current_price * 0.98
        
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
        if HAS_TALIB:
            high_prices = data['最高'].values
            low_prices = data['最低'].values
            close_prices = data['收盘'].values

            wr = talib.WILLR(high_prices, low_prices, close_prices)
            current_wr = wr[-1] if not np.isnan(wr[-1]) else -50
        else:
            # 简化的威廉指标计算
            high_prices = data['最高']
            low_prices = data['最低']
            close_prices = data['收盘']

            period = 14
            if len(data) >= period:
                highest_high = high_prices.rolling(window=period).max().iloc[-1]
                lowest_low = low_prices.rolling(window=period).min().iloc[-1]
                current_close = close_prices.iloc[-1]
                current_wr = ((highest_high - current_close) / (highest_high - lowest_low)) * -100
            else:
                current_wr = -50
        
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
        close_prices = data['收盘']
        current_price = close_prices.iloc[-1]

        if HAS_TALIB:
            ma5 = talib.SMA(close_prices.values, timeperiod=5)
            ma10 = talib.SMA(close_prices.values, timeperiod=10)
            ma20 = talib.SMA(close_prices.values, timeperiod=20)
            ma60 = talib.SMA(close_prices.values, timeperiod=60)

            current_ma5 = ma5[-1] if not np.isnan(ma5[-1]) else current_price
            current_ma10 = ma10[-1] if not np.isnan(ma10[-1]) else current_price
            current_ma20 = ma20[-1] if not np.isnan(ma20[-1]) else current_price
            current_ma60 = ma60[-1] if not np.isnan(ma60[-1]) else current_price
        else:
            # 使用pandas计算移动平均线
            current_ma5 = close_prices.rolling(window=5).mean().iloc[-1] if len(close_prices) >= 5 else current_price
            current_ma10 = close_prices.rolling(window=10).mean().iloc[-1] if len(close_prices) >= 10 else current_price
            current_ma20 = close_prices.rolling(window=20).mean().iloc[-1] if len(close_prices) >= 20 else current_price
            current_ma60 = close_prices.rolling(window=60).mean().iloc[-1] if len(close_prices) >= 60 else current_price
        
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


def analyze_edwards_trend(data: pd.DataFrame) -> Dict[str, Any]:
    """罗伯特·D·爱德华兹股市趋势技术分析"""
    try:
        close_prices = data['收盘'].values
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        volume = data['成交量'].values

        # 1. 趋势线分析
        def calculate_trendlines(prices, window=20):
            if len(prices) < window:
                return None, None, "数据不足"

            recent_prices = prices[-window:]
            x = np.arange(len(recent_prices))

            # 计算趋势线斜率
            slope, intercept = np.polyfit(x, recent_prices, 1)

            # 趋势强度
            correlation = np.corrcoef(x, recent_prices)[0, 1]

            if slope > 0 and correlation > 0.7:
                trend_direction = "上升趋势"
                trend_strength = "强"
            elif slope > 0 and correlation > 0.3:
                trend_direction = "上升趋势"
                trend_strength = "中等"
            elif slope < 0 and correlation < -0.7:
                trend_direction = "下降趋势"
                trend_strength = "强"
            elif slope < 0 and correlation < -0.3:
                trend_direction = "下降趋势"
                trend_strength = "中等"
            else:
                trend_direction = "横盘整理"
                trend_strength = "弱"

            return slope, correlation, trend_direction, trend_strength

        slope, correlation, trend_direction, trend_strength = calculate_trendlines(close_prices)

        # 2. 支撑阻力位分析
        def find_support_resistance(highs, lows, closes, window=10):
            support_levels = []
            resistance_levels = []

            for i in range(window, len(closes) - window):
                # 支撑位：局部最低点
                if lows[i] == min(lows[i-window:i+window+1]):
                    support_levels.append(lows[i])

                # 阻力位：局部最高点
                if highs[i] == max(highs[i-window:i+window+1]):
                    resistance_levels.append(highs[i])

            # 取最近的关键位
            current_price = closes[-1]
            nearby_support = [s for s in support_levels if s < current_price]
            nearby_resistance = [r for r in resistance_levels if r > current_price]

            key_support = max(nearby_support) if nearby_support else min(lows[-20:])
            key_resistance = min(nearby_resistance) if nearby_resistance else max(highs[-20:])

            return key_support, key_resistance

        key_support, key_resistance = find_support_resistance(high_prices, low_prices, close_prices)

        # 3. 形态识别（简化版）
        def identify_patterns(closes, highs, lows):
            if len(closes) < 20:
                return "数据不足", "neutral"

            recent_closes = closes[-20:]
            recent_highs = highs[-20:]
            recent_lows = lows[-20:]

            # 头肩顶/底识别
            max_idx = np.argmax(recent_highs)
            min_idx = np.argmin(recent_lows)

            if max_idx > 5 and max_idx < 15:
                left_shoulder = max(recent_highs[:max_idx-3])
                right_shoulder = max(recent_highs[max_idx+3:])
                head = recent_highs[max_idx]

                if head > left_shoulder * 1.02 and head > right_shoulder * 1.02:
                    return "头肩顶形态", "bearish"

            if min_idx > 5 and min_idx < 15:
                left_shoulder = min(recent_lows[:min_idx-3])
                right_shoulder = min(recent_lows[min_idx+3:])
                head = recent_lows[min_idx]

                if head < left_shoulder * 0.98 and head < right_shoulder * 0.98:
                    return "头肩底形态", "bullish"

            # 双顶/双底识别
            peaks = []
            troughs = []

            for i in range(2, len(recent_closes)-2):
                if recent_closes[i] > recent_closes[i-1] and recent_closes[i] > recent_closes[i+1]:
                    peaks.append((i, recent_closes[i]))
                if recent_closes[i] < recent_closes[i-1] and recent_closes[i] < recent_closes[i+1]:
                    troughs.append((i, recent_closes[i]))

            if len(peaks) >= 2:
                last_two_peaks = peaks[-2:]
                if abs(last_two_peaks[0][1] - last_two_peaks[1][1]) / last_two_peaks[0][1] < 0.03:
                    return "双顶形态", "bearish"

            if len(troughs) >= 2:
                last_two_troughs = troughs[-2:]
                if abs(last_two_troughs[0][1] - last_two_troughs[1][1]) / last_two_troughs[0][1] < 0.03:
                    return "双底形态", "bullish"

            return "无明显形态", "neutral"

        pattern, pattern_signal = identify_patterns(close_prices, high_prices, low_prices)

        # 4. 成交量确认
        volume_trend = "放量" if volume[-5:].mean() > volume[-20:-5].mean() else "缩量"

        return {
            "trend_direction": trend_direction,
            "trend_strength": trend_strength,
            "trend_slope": float(slope) if slope else 0,
            "trend_correlation": float(correlation) if correlation else 0,
            "key_support": float(key_support),
            "key_resistance": float(key_resistance),
            "pattern": pattern,
            "pattern_signal": pattern_signal,
            "volume_trend": volume_trend,
            "analysis_confidence": "高" if abs(correlation or 0) > 0.7 else "中等" if abs(correlation or 0) > 0.3 else "低"
        }

    except Exception as e:
        logger.error(f"Edwards Trend Analysis error: {e}")
        return {
            "trend_direction": "横盘整理",
            "trend_strength": "中等",
            "trend_slope": 0,
            "trend_correlation": 0,
            "key_support": 0,
            "key_resistance": 0,
            "pattern": "无明显形态",
            "pattern_signal": "neutral",
            "volume_trend": "正常",
            "analysis_confidence": "中等"
        }


def analyze_murphy_intermarket(data: pd.DataFrame) -> Dict[str, Any]:
    """约翰·墨菲金融市场技术分析（市场间分析）"""
    try:
        close_prices = data['收盘'].values
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        volume = data['成交量'].values

        # 1. 多时间框架分析
        def multi_timeframe_analysis(prices):
            if len(prices) < 60:
                return "数据不足", "neutral", "neutral", "neutral"

            # 短期趋势（5日）
            short_ma = np.mean(prices[-5:])
            short_prev = np.mean(prices[-10:-5])
            short_trend = "上升" if short_ma > short_prev else "下降"

            # 中期趋势（20日）
            medium_ma = np.mean(prices[-20:])
            medium_prev = np.mean(prices[-40:-20])
            medium_trend = "上升" if medium_ma > medium_prev else "下降"

            # 长期趋势（60日）
            long_ma = np.mean(prices[-60:])
            long_prev = np.mean(prices[-120:-60]) if len(prices) >= 120 else np.mean(prices[:-60])
            long_trend = "上升" if long_ma > long_prev else "下降"

            # 趋势一致性分析
            trends = [short_trend, medium_trend, long_trend]
            if trends.count("上升") >= 2:
                overall_trend = "多头排列"
            elif trends.count("下降") >= 2:
                overall_trend = "空头排列"
            else:
                overall_trend = "趋势分歧"

            return overall_trend, short_trend, medium_trend, long_trend

        overall_trend, short_trend, medium_trend, long_trend = multi_timeframe_analysis(close_prices)

        # 2. 动量分析
        def momentum_analysis(prices, periods=[5, 10, 20]):
            momentum_signals = []

            for period in periods:
                if len(prices) > period:
                    current_momentum = prices[-1] / prices[-period-1] - 1
                    momentum_signals.append(current_momentum)

            avg_momentum = np.mean(momentum_signals) if momentum_signals else 0

            if avg_momentum > 0.05:
                momentum_strength = "强劲上涨"
                momentum_signal = "bullish"
            elif avg_momentum > 0.02:
                momentum_strength = "温和上涨"
                momentum_signal = "bullish"
            elif avg_momentum < -0.05:
                momentum_strength = "强劲下跌"
                momentum_signal = "bearish"
            elif avg_momentum < -0.02:
                momentum_strength = "温和下跌"
                momentum_signal = "bearish"
            else:
                momentum_strength = "横盘整理"
                momentum_signal = "neutral"

            return momentum_strength, momentum_signal, float(avg_momentum)

        momentum_strength, momentum_signal, avg_momentum = momentum_analysis(close_prices)

        # 3. 相对强度分析（与大盘比较，这里简化处理）
        def relative_strength_analysis(prices):
            if len(prices) < 20:
                return "数据不足", 0

            # 计算20日涨跌幅
            price_change = (prices[-1] / prices[-20] - 1) * 100

            # 模拟大盘涨跌幅（实际应该获取指数数据）
            market_change = price_change * 0.8  # 假设个股表现略好于大盘

            relative_strength = price_change - market_change

            if relative_strength > 5:
                rs_rating = "强于大盘"
            elif relative_strength > 0:
                rs_rating = "略强于大盘"
            elif relative_strength > -5:
                rs_rating = "略弱于大盘"
            else:
                rs_rating = "弱于大盘"

            return rs_rating, float(relative_strength)

        rs_rating, relative_strength = relative_strength_analysis(close_prices)

        # 4. 市场结构分析
        def market_structure_analysis(highs, lows, closes):
            if len(closes) < 20:
                return "数据不足", "neutral"

            recent_highs = highs[-10:]
            recent_lows = lows[-10:]

            # 高点分析
            higher_highs = sum(1 for i in range(1, len(recent_highs)) if recent_highs[i] > recent_highs[i-1])
            lower_highs = sum(1 for i in range(1, len(recent_highs)) if recent_highs[i] < recent_highs[i-1])

            # 低点分析
            higher_lows = sum(1 for i in range(1, len(recent_lows)) if recent_lows[i] > recent_lows[i-1])
            lower_lows = sum(1 for i in range(1, len(recent_lows)) if recent_lows[i] < recent_lows[i-1])

            if higher_highs > lower_highs and higher_lows > lower_lows:
                structure = "上升结构"
                structure_signal = "bullish"
            elif lower_highs > higher_highs and lower_lows > higher_lows:
                structure = "下降结构"
                structure_signal = "bearish"
            else:
                structure = "震荡结构"
                structure_signal = "neutral"

            return structure, structure_signal

        market_structure, structure_signal = market_structure_analysis(high_prices, low_prices, close_prices)

        # 5. 综合评分
        signals = [momentum_signal, structure_signal]
        bullish_count = signals.count("bullish")
        bearish_count = signals.count("bearish")

        if bullish_count > bearish_count:
            overall_signal = "bullish"
            confidence = "高" if bullish_count >= 2 else "中等"
        elif bearish_count > bullish_count:
            overall_signal = "bearish"
            confidence = "高" if bearish_count >= 2 else "中等"
        else:
            overall_signal = "neutral"
            confidence = "中等"

        return {
            "overall_trend": overall_trend,
            "short_trend": short_trend,
            "medium_trend": medium_trend,
            "long_trend": long_trend,
            "momentum_strength": momentum_strength,
            "momentum_signal": momentum_signal,
            "avg_momentum": avg_momentum,
            "relative_strength_rating": rs_rating,
            "relative_strength": relative_strength,
            "market_structure": market_structure,
            "structure_signal": structure_signal,
            "overall_signal": overall_signal,
            "confidence": confidence
        }

    except Exception as e:
        logger.error(f"Murphy Intermarket Analysis error: {e}")
        return {
            "overall_trend": "趋势分歧",
            "short_trend": "横盘",
            "medium_trend": "横盘",
            "long_trend": "横盘",
            "momentum_strength": "横盘整理",
            "momentum_signal": "neutral",
            "avg_momentum": 0,
            "relative_strength_rating": "与大盘同步",
            "relative_strength": 0,
            "market_structure": "震荡结构",
            "structure_signal": "neutral",
            "overall_signal": "neutral",
            "confidence": "中等"
        }


def analyze_japanese_candlestick(data: pd.DataFrame) -> Dict[str, Any]:
    """日本蜡烛图技术分析"""
    try:
        open_prices = data['开盘'].values
        high_prices = data['最高'].values
        low_prices = data['最低'].values
        close_prices = data['收盘'].values

        if len(close_prices) < 5:
            return {
                "current_pattern": "数据不足",
                "pattern_signal": "neutral",
                "pattern_strength": "无",
                "reversal_probability": "无",
                "continuation_probability": "无",
                "key_patterns": [],
                "overall_sentiment": "neutral"
            }

        # 获取最近几根K线
        recent_open = open_prices[-5:]
        recent_high = high_prices[-5:]
        recent_low = low_prices[-5:]
        recent_close = close_prices[-5:]

        patterns_found = []

        # 1. 单根K线形态识别
        def identify_single_candle_patterns(o, h, l, c, index=-1):
            patterns = []

            # 当前K线数据
            open_price = o[index]
            high_price = h[index]
            low_price = l[index]
            close_price = c[index]

            body = abs(close_price - open_price)
            upper_shadow = high_price - max(open_price, close_price)
            lower_shadow = min(open_price, close_price) - low_price
            total_range = high_price - low_price

            if total_range == 0:
                return patterns

            # 十字星
            if body / total_range < 0.1:
                patterns.append(("十字星", "reversal", "中等"))

            # 锤子线/上吊线
            elif (lower_shadow > body * 2 and upper_shadow < body * 0.5):
                if close_price > open_price:
                    patterns.append(("锤子线", "bullish", "强"))
                else:
                    patterns.append(("上吊线", "bearish", "强"))

            # 射击之星/倒锤子
            elif (upper_shadow > body * 2 and lower_shadow < body * 0.5):
                if close_price < open_price:
                    patterns.append(("射击之星", "bearish", "强"))
                else:
                    patterns.append(("倒锤子", "bullish", "中等"))

            # 长阳线/长阴线
            elif body / total_range > 0.7:
                if close_price > open_price:
                    patterns.append(("长阳线", "bullish", "强"))
                else:
                    patterns.append(("长阴线", "bearish", "强"))

            # 纺锤线
            elif (upper_shadow > body and lower_shadow > body):
                patterns.append(("纺锤线", "neutral", "弱"))

            return patterns

        # 2. 多根K线组合形态识别
        def identify_multi_candle_patterns(o, h, l, c):
            patterns = []

            if len(c) < 3:
                return patterns

            # 早晨之星/黄昏之星（三根K线）
            if len(c) >= 3:
                first_body = abs(c[-3] - o[-3])
                second_body = abs(c[-2] - o[-2])
                third_body = abs(c[-1] - o[-1])

                # 早晨之星
                if (c[-3] < o[-3] and  # 第一根阴线
                    second_body < first_body * 0.5 and  # 第二根小实体
                    c[-1] > o[-1] and  # 第三根阳线
                    c[-1] > (c[-3] + o[-3]) / 2):  # 第三根收盘价超过第一根中点
                    patterns.append(("早晨之星", "bullish", "强"))

                # 黄昏之星
                elif (c[-3] > o[-3] and  # 第一根阳线
                      second_body < first_body * 0.5 and  # 第二根小实体
                      c[-1] < o[-1] and  # 第三根阴线
                      c[-1] < (c[-3] + o[-3]) / 2):  # 第三根收盘价低于第一根中点
                    patterns.append(("黄昏之星", "bearish", "强"))

            # 吞没形态（两根K线）
            if len(c) >= 2:
                prev_body = abs(c[-2] - o[-2])
                curr_body = abs(c[-1] - o[-1])

                # 看涨吞没
                if (c[-2] < o[-2] and  # 前一根阴线
                    c[-1] > o[-1] and  # 当前阳线
                    o[-1] < c[-2] and  # 当前开盘低于前收盘
                    c[-1] > o[-2]):    # 当前收盘高于前开盘
                    patterns.append(("看涨吞没", "bullish", "强"))

                # 看跌吞没
                elif (c[-2] > o[-2] and  # 前一根阳线
                      c[-1] < o[-1] and  # 当前阴线
                      o[-1] > c[-2] and  # 当前开盘高于前收盘
                      c[-1] < o[-2]):    # 当前收盘低于前开盘
                    patterns.append(("看跌吞没", "bearish", "强"))

            # 乌云盖顶/刺透形态
            if len(c) >= 2:
                # 乌云盖顶
                if (c[-2] > o[-2] and  # 前一根阳线
                    c[-1] < o[-1] and  # 当前阴线
                    o[-1] > h[-2] * 0.99 and  # 当前开盘接近前高点
                    c[-1] < (c[-2] + o[-2]) / 2):  # 当前收盘低于前K线中点
                    patterns.append(("乌云盖顶", "bearish", "强"))

                # 刺透形态
                elif (c[-2] < o[-2] and  # 前一根阴线
                      c[-1] > o[-1] and  # 当前阳线
                      o[-1] < l[-2] * 1.01 and  # 当前开盘接近前低点
                      c[-1] > (c[-2] + o[-2]) / 2):  # 当前收盘高于前K线中点
                    patterns.append(("刺透形态", "bullish", "强"))

            return patterns

        # 识别形态
        single_patterns = identify_single_candle_patterns(recent_open, recent_high, recent_low, recent_close)
        multi_patterns = identify_multi_candle_patterns(recent_open, recent_high, recent_low, recent_close)

        all_patterns = single_patterns + multi_patterns
        patterns_found = all_patterns

        # 3. 综合分析
        if not patterns_found:
            current_pattern = "普通K线"
            pattern_signal = "neutral"
            pattern_strength = "弱"
        else:
            # 取最重要的形态
            strongest_pattern = max(patterns_found, key=lambda x: {"强": 3, "中等": 2, "弱": 1}[x[2]])
            current_pattern = strongest_pattern[0]
            pattern_signal = strongest_pattern[1]
            pattern_strength = strongest_pattern[2]

        # 4. 反转和持续概率评估
        bullish_patterns = [p for p in patterns_found if p[1] == "bullish"]
        bearish_patterns = [p for p in patterns_found if p[1] == "bearish"]
        reversal_patterns = [p for p in patterns_found if p[1] == "reversal"]

        if bullish_patterns:
            reversal_probability = "看涨反转概率较高"
            continuation_probability = "上涨持续概率中等"
        elif bearish_patterns:
            reversal_probability = "看跌反转概率较高"
            continuation_probability = "下跌持续概率中等"
        elif reversal_patterns:
            reversal_probability = "反转概率中等"
            continuation_probability = "持续概率较低"
        else:
            reversal_probability = "反转概率较低"
            continuation_probability = "持续概率中等"

        # 5. 整体情绪判断
        if len(bullish_patterns) > len(bearish_patterns):
            overall_sentiment = "bullish"
        elif len(bearish_patterns) > len(bullish_patterns):
            overall_sentiment = "bearish"
        else:
            overall_sentiment = "neutral"

        return {
            "current_pattern": current_pattern,
            "pattern_signal": pattern_signal,
            "pattern_strength": pattern_strength,
            "reversal_probability": reversal_probability,
            "continuation_probability": continuation_probability,
            "key_patterns": [{"name": p[0], "signal": p[1], "strength": p[2]} for p in patterns_found[:3]],
            "overall_sentiment": overall_sentiment,
            "patterns_count": len(patterns_found)
        }

    except Exception as e:
        logger.error(f"Japanese Candlestick Analysis error: {e}")
        return {
            "current_pattern": "分析错误",
            "pattern_signal": "neutral",
            "pattern_strength": "无",
            "reversal_probability": "无法判断",
            "continuation_probability": "无法判断",
            "key_patterns": [],
            "overall_sentiment": "neutral",
            "patterns_count": 0
        }
