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
    calculate_volume_analysis, calculate_turnover_rate, calculate_elliott_wave
)

logger = logging.getLogger(__name__)


class StockAnalysisService:
    """股票分析服务类"""

    def __init__(self):
        pass

    def analyze_stock(self, symbol: str, name: str, current_price: float,
                     change_percent: float, hist_data: pd.DataFrame) -> StockAnalysisResponse:
        """执行完整的股票技术分析"""
        try:
            logger.info(f"Starting analysis for {symbol} - {name}")
            # 计算各项技术指标
            macd = calculate_macd(hist_data)
            kdj = calculate_kdj(hist_data)
            rsi = calculate_rsi(hist_data)
            boll = calculate_bollinger_bands(hist_data)
            wr = calculate_williams_r(hist_data)
            gann = calculate_gann_lines(hist_data)
            ma = calculate_moving_averages(hist_data)
            volume = calculate_volume_analysis(hist_data)
            turnover_rate = calculate_turnover_rate(hist_data, current_price)
            elliott_wave = calculate_elliott_wave(hist_data)

            # 创建技术指标对象
            technical_analysis = TechnicalIndicators(
                macd=macd,
                kdj=kdj,
                rsi=rsi,
                boll=boll,
                wr=wr,
                gann=gann,
                ma=ma,
                volume=volume,
                turnover_rate=turnover_rate,
                elliott_wave=elliott_wave
            )

            # 基本面分析（使用模拟数据）
            logger.info("Starting fundamental analysis...")
            fundamental_data = self._get_mock_fundamental_data(symbol, current_price)
            fundamental_signals = self._generate_mock_fundamental_signals(symbol)
            fundamental_recommendation = self._get_mock_fundamental_recommendation(symbol)
            logger.info(f"Fundamental analysis completed: {fundamental_recommendation}")

            # 生成技术信号
            technical_signals = self._generate_signals(technical_analysis)

            # 生成技术建议
            technical_recommendation = self._generate_recommendation(technical_analysis)

            # 综合建议
            overall_recommendation = self._generate_overall_recommendation(
                technical_recommendation, fundamental_recommendation
            )

            # 合并分析数据
            technical_dict = technical_analysis.dict()
            # 转换numpy类型为Python原生类型
            technical_dict = self._convert_numpy_types(technical_dict)
            combined_analysis = {
                "technical": technical_dict,
                "fundamental": fundamental_data
            }

            # 合并信号
            combined_signals = {
                "technical_signals": technical_signals.get("signals", []),
                "fundamental_signals": fundamental_signals,
                "all_signals": technical_signals.get("signals", []) + fundamental_signals
            }

            return StockAnalysisResponse(
                symbol=symbol,
                name=name,
                current_price=current_price,
                change_percent=change_percent,
                analysis=combined_analysis,
                signals=combined_signals,
                recommendation=f"技术面: {technical_recommendation} | 基本面: {fundamental_recommendation} | 综合: {overall_recommendation}"
            )
            
        except Exception as e:
            logger.error(f"Stock analysis error: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
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



    def _generate_overall_recommendation(self, technical_rec: str, fundamental_rec: str) -> str:
        """生成综合投资建议"""
        try:
            # 建议权重映射
            rec_weights = {
                "买入": 3,
                "增持": 2,
                "持有": 1,
                "减持": 0,
                "卖出": -1
            }

            tech_weight = rec_weights.get(technical_rec, 1)
            fund_weight = rec_weights.get(fundamental_rec, 1)

            # 综合评分（技术面权重40%，基本面权重60%）
            combined_score = tech_weight * 0.4 + fund_weight * 0.6

            if combined_score >= 2.5:
                return "买入"
            elif combined_score >= 1.5:
                return "增持"
            elif combined_score >= 0.5:
                return "持有"
            elif combined_score >= -0.5:
                return "减持"
            else:
                return "卖出"

        except Exception as e:
            logger.error(f"Generate overall recommendation error: {e}")
            return "持有"

    def _get_mock_fundamental_data(self, symbol: str, current_price: float) -> dict:
        """获取模拟基本面数据"""
        import random

        # 根据股票代码生成不同的基本面特征
        company_names = {
            '000001': '平安银行',
            '000002': '万科A',
            '600036': '招商银行',
            '600519': '贵州茅台',
            '000858': '五粮液'
        }

        industries = {
            '000001': {'industry': '银行', 'sector': '金融业'},
            '000002': {'industry': '房地产开发', 'sector': '房地产业'},
            '600036': {'industry': '银行', 'sector': '金融业'},
            '600519': {'industry': '白酒', 'sector': '食品饮料'},
            '000858': {'industry': '白酒', 'sector': '食品饮料'}
        }

        company_name = company_names.get(symbol, f'股票-{symbol}')
        industry_info = industries.get(symbol, {'industry': '制造业', 'sector': '工业'})

        # 生成财务数据
        if symbol in ['000001', '600036']:  # 银行股
            financial_data = {
                "revenue": round(random.uniform(800, 1500), 2),
                "net_profit": round(random.uniform(200, 400), 2),
                "pe_ratio": round(random.uniform(5, 8), 2),
                "pb_ratio": round(random.uniform(0.6, 1.0), 2),
                "roe": round(random.uniform(12, 18), 2),
                "dividend_yield": round(random.uniform(3, 6), 2)
            }
            valuation = "低估" if financial_data["pe_ratio"] < 6.5 else "合理"
            growth_level = "稳定增长"
            roe_level = "优秀" if financial_data["roe"] > 15 else "良好"
            health_level = "优秀"
            highlights = ["银行业龙头企业", "资本充足率高", "风控能力强", "分红稳定"]
            risks = ["利率风险", "信用风险", "政策调控风险"]
        elif symbol in ['600519', '000858']:  # 白酒股
            financial_data = {
                "revenue": round(random.uniform(500, 1200), 2),
                "net_profit": round(random.uniform(200, 600), 2),
                "pe_ratio": round(random.uniform(15, 25), 2),
                "pb_ratio": round(random.uniform(3, 6), 2),
                "roe": round(random.uniform(20, 30), 2),
                "dividend_yield": round(random.uniform(1, 3), 2)
            }
            valuation = "合理" if financial_data["pe_ratio"] < 20 else "偏高"
            growth_level = "高成长"
            roe_level = "优秀"
            health_level = "优秀"
            highlights = ["高端白酒龙头", "品牌价值高", "定价能力强", "现金流充沛"]
            risks = ["消费降级风险", "政策风险", "竞争加剧"]
        else:  # 其他股票
            financial_data = {
                "revenue": round(random.uniform(100, 800), 2),
                "net_profit": round(random.uniform(10, 100), 2),
                "pe_ratio": round(random.uniform(10, 30), 2),
                "pb_ratio": round(random.uniform(1, 3), 2),
                "roe": round(random.uniform(8, 15), 2),
                "dividend_yield": round(random.uniform(1, 4), 2)
            }
            valuation = "合理"
            growth_level = "稳定增长"
            roe_level = "良好" if financial_data["roe"] > 10 else "一般"
            health_level = "良好"
            highlights = ["行业地位稳固", "技术实力强", "市场份额领先"]
            risks = ["市场竞争风险", "原材料价格波动", "技术更新风险"]

        return {
            "company_info": {
                "name": company_name,
                "industry": industry_info['industry'],
                "sector": industry_info['sector'],
                "market": "深圳" if symbol.startswith('0') or symbol.startswith('3') else "上海",
                "market_cap": round(current_price * random.uniform(50, 500), 2)
            },
            "financial_data": financial_data,
            "industry_analysis": {
                "industry_name": industry_info['industry'],
                "market_position": "行业龙头" if symbol in ['000001', '600036', '600519'] else "行业领先"
            },
            "valuation_analysis": {"overall_valuation": valuation},
            "growth_analysis": {"growth_level": growth_level},
            "profitability_analysis": {"roe_level": roe_level},
            "financial_health": {"health_level": health_level},
            "investment_highlights": highlights,
            "risk_factors": risks
        }

    def _generate_mock_fundamental_signals(self, symbol: str) -> list:
        """生成模拟基本面信号"""
        signals = []

        if symbol in ['000001', '600036']:  # 银行股
            signals = [
                "估值处于历史低位，具备投资价值",
                "净资产收益率稳定，盈利能力强",
                "分红收益率较高，投资回报稳定",
                "银行业龙头地位，竞争优势明显"
            ]
        elif symbol in ['600519', '000858']:  # 白酒股
            signals = [
                "高端白酒需求旺盛，业绩增长确定性强",
                "品牌价值持续提升，定价能力强",
                "现金流充沛，财务结构优秀",
                "行业集中度提升，龙头受益"
            ]
        else:
            signals = [
                "基本面稳健，财务指标良好",
                "行业地位稳固，竞争优势明显",
                "业绩增长稳定，投资价值显现"
            ]

        return signals[:3]  # 返回前3个信号

    def _convert_numpy_types(self, obj):
        """递归转换numpy类型为Python原生类型"""
        import numpy as np

        if isinstance(obj, dict):
            return {key: self._convert_numpy_types(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_types(item) for item in obj]
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj

    def _get_mock_fundamental_recommendation(self, symbol: str) -> str:
        """获取模拟基本面建议"""
        import random

        if symbol in ['000001', '600036']:  # 银行股
            return random.choice(["增持", "买入"])
        elif symbol in ['600519', '000858']:  # 白酒股
            return random.choice(["持有", "增持"])
        else:
            return random.choice(["持有", "增持", "买入"])
