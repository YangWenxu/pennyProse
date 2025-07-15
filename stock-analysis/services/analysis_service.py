"""
股票分析服务
"""
import pandas as pd
from typing import Dict, Any, List
import logging
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import TechnicalIndicators, StockAnalysisResponse
from utils.technical_analysis import (
    calculate_macd, calculate_kdj, calculate_rsi, calculate_bollinger_bands,
    calculate_williams_r, calculate_gann_lines, calculate_moving_averages,
    calculate_volume_analysis
)

logger = logging.getLogger(__name__)


class StockAnalysisService:
    """股票分析服务类"""
    
    def analyze_stock(self, symbol: str, name: str, current_price: float, 
                     change_percent: float, hist_data: pd.DataFrame) -> StockAnalysisResponse:
        """执行完整的股票技术分析"""
        try:
            # 计算各项技术指标
            macd = calculate_macd(hist_data)
            kdj = calculate_kdj(hist_data)
            rsi = calculate_rsi(hist_data)
            boll = calculate_bollinger_bands(hist_data)
            wr = calculate_williams_r(hist_data)
            gann = calculate_gann_lines(hist_data)
            ma = calculate_moving_averages(hist_data)
            volume = calculate_volume_analysis(hist_data)
            
            # 创建技术指标对象
            analysis = TechnicalIndicators(
                macd=macd,
                kdj=kdj,
                rsi=rsi,
                boll=boll,
                wr=wr,
                gann=gann,
                ma=ma,
                volume=volume
            )
            
            # 生成技术信号
            signals = self._generate_signals(analysis)
            
            # 生成投资建议
            recommendation = self._generate_recommendation(analysis)
            
            return StockAnalysisResponse(
                symbol=symbol,
                name=name,
                current_price=current_price,
                change_percent=change_percent,
                analysis=analysis,
                signals=signals,
                recommendation=recommendation
            )
            
        except Exception as e:
            logger.error(f"Stock analysis error: {e}")
            # 返回默认分析结果
            return self._get_default_analysis(symbol, name, current_price, change_percent)
    
    def _generate_signals(self, analysis: TechnicalIndicators) -> Dict[str, List[str]]:
        """生成技术信号"""
        signals = []
        
        try:
            # MACD信号
            if analysis.macd["trend"] == "bullish":
                signals.append("MACD呈多头趋势")
            elif analysis.macd["trend"] == "bearish":
                signals.append("MACD呈空头趋势")
            
            # KDJ信号
            if analysis.kdj["overbought"]:
                signals.append("KDJ指标显示超买")
            elif analysis.kdj["oversold"]:
                signals.append("KDJ指标显示超卖")
            
            # RSI信号
            if analysis.rsi["overbought"]:
                signals.append("RSI指标显示超买")
            elif analysis.rsi["oversold"]:
                signals.append("RSI指标显示超卖")
            
            # 布林带信号
            if analysis.boll["position"] == "upper":
                signals.append("价格触及布林带上轨")
            elif analysis.boll["position"] == "lower":
                signals.append("价格触及布林带下轨")
            elif analysis.boll["squeeze"]:
                signals.append("布林带收窄")
            
            # 威廉指标信号
            if analysis.wr["overbought"]:
                signals.append("威廉指标显示超买")
            elif analysis.wr["oversold"]:
                signals.append("威廉指标显示超卖")
            
            # 均线信号
            if analysis.ma["cross_signal"] == "golden_cross":
                signals.append("均线金叉")
            elif analysis.ma["cross_signal"] == "death_cross":
                signals.append("均线死叉")
            elif analysis.ma["bullish_alignment"]:
                signals.append("均线多头排列")
            
            # 量能信号
            if analysis.volume["volume_price_signal"] == "bullish":
                signals.append("量价齐升")
            elif analysis.volume["volume_price_signal"] == "bearish":
                signals.append("量价背离")
            
            # 江恩线信号
            if analysis.gann["trend"] == "bullish":
                signals.append("江恩线显示上升趋势")
            elif analysis.gann["trend"] == "bearish":
                signals.append("江恩线显示下降趋势")
            
        except Exception as e:
            logger.error(f"Signal generation error: {e}")
            signals = ["技术指标计算中"]
        
        return {"signals": signals}
    
    def _generate_recommendation(self, analysis: TechnicalIndicators) -> str:
        """生成投资建议"""
        try:
            bullish_signals = 0
            bearish_signals = 0
            
            # MACD评分
            if analysis.macd["trend"] == "bullish":
                bullish_signals += 1
            elif analysis.macd["trend"] == "bearish":
                bearish_signals += 1
            
            # KDJ评分
            if analysis.kdj["oversold"]:
                bullish_signals += 1
            elif analysis.kdj["overbought"]:
                bearish_signals += 1
            
            # RSI评分
            if analysis.rsi["oversold"]:
                bullish_signals += 1
            elif analysis.rsi["overbought"]:
                bearish_signals += 1
            
            # 布林带评分
            if analysis.boll["position"] == "lower":
                bullish_signals += 1
            elif analysis.boll["position"] == "upper":
                bearish_signals += 1
            
            # 威廉指标评分
            if analysis.wr["oversold"]:
                bullish_signals += 1
            elif analysis.wr["overbought"]:
                bearish_signals += 1
            
            # 均线评分
            if analysis.ma["cross_signal"] == "golden_cross" or analysis.ma["bullish_alignment"]:
                bullish_signals += 1
            elif analysis.ma["cross_signal"] == "death_cross":
                bearish_signals += 1
            
            # 量能评分
            if analysis.volume["volume_price_signal"] == "bullish":
                bullish_signals += 1
            elif analysis.volume["volume_price_signal"] == "bearish":
                bearish_signals += 1
            
            # 江恩线评分
            if analysis.gann["trend"] == "bullish":
                bullish_signals += 1
            elif analysis.gann["trend"] == "bearish":
                bearish_signals += 1
            
            # 生成建议
            if bullish_signals > bearish_signals + 1:
                return "买入"
            elif bearish_signals > bullish_signals + 1:
                return "卖出"
            else:
                return "持有"
                
        except Exception as e:
            logger.error(f"Recommendation generation error: {e}")
            return "持有"
    
    def _get_default_analysis(self, symbol: str, name: str, current_price: float, 
                            change_percent: float) -> StockAnalysisResponse:
        """获取默认分析结果"""
        default_analysis = TechnicalIndicators(
            macd={"macd": 0, "signal": 0, "histogram": 0, "trend": "neutral"},
            kdj={"k": 50, "d": 50, "j": 50, "signal": "neutral", "overbought": False, "oversold": False},
            rsi={"rsi": 50, "signal": "neutral", "overbought": False, "oversold": False},
            boll={"upper": current_price * 1.02, "middle": current_price, "lower": current_price * 0.98, "position": "middle", "squeeze": False},
            wr={"wr": -50, "signal": "neutral", "overbought": False, "oversold": False},
            gann={"gann_1x1": current_price, "gann_2x1": current_price, "gann_1x2": current_price, "trend": "neutral", "angle": 0.0, "recent_high": current_price * 1.05, "recent_low": current_price * 0.95, "support_level": current_price * 0.95, "resistance_level": current_price * 1.05},
            ma={"ma5": current_price, "ma10": current_price, "ma20": current_price, "ma60": current_price, "bullish_alignment": False, "cross_signal": "neutral", "above_ma20": True},
            volume={"current_volume": 1000000.0, "volume_ma5": 1000000.0, "volume_ma10": 1000000.0, "volume_ratio": 1.0, "volume_price_signal": "neutral"}
        )
        
        return StockAnalysisResponse(
            symbol=symbol,
            name=name,
            current_price=current_price,
            change_percent=change_percent,
            analysis=default_analysis,
            signals={"signals": ["数据获取中"]},
            recommendation="持有"
        )
