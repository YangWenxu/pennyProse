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
    calculate_volume_analysis, calculate_turnover_rate, calculate_elliott_wave,
    analyze_edwards_trend, analyze_murphy_intermarket, analyze_japanese_candlestick
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
            edwards_trend = analyze_edwards_trend(hist_data)
            murphy_intermarket = analyze_murphy_intermarket(hist_data)
            japanese_candlestick = analyze_japanese_candlestick(hist_data)

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
                elliott_wave=elliott_wave,
                edwards_trend=edwards_trend,
                murphy_intermarket=murphy_intermarket,
                japanese_candlestick=japanese_candlestick
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

            # 生成综合分析
            comprehensive_analysis = self._get_comprehensive_analysis(
                technical_dict,
                fundamental_data,
                current_price
            )

            combined_analysis = {
                "technical": technical_dict,
                "fundamental": fundamental_data,
                "comprehensive": comprehensive_analysis
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

        # 计算目标价和上涨空间
        target_price = round(current_price * random.uniform(1.05, 1.25), 2)
        upside_potential = round(((target_price - current_price) / current_price) * 100, 2)

        # 计算成长率
        revenue_growth = round(random.uniform(5, 20), 2)
        profit_growth = round(random.uniform(8, 25), 2)

        # 计算财务健康指标
        debt_ratio = round(random.uniform(20, 60), 2)
        current_ratio = round(random.uniform(1.2, 2.5), 2)
        health_score = round(random.uniform(75, 95), 1)

        # 行业分析
        industry_trend = random.choice(["上升", "稳定", "下降"])
        market_share = round(random.uniform(5, 25), 2)

        # 基本面评分计算 (仅用于基本面分析，不包含综合评分)
        # 这里移除综合评分逻辑，将在单独的方法中处理

        return {
            "company_info": {
                "name": company_name,
                "industry": industry_info['industry'],
                "sector": industry_info['sector'],
                "market": "深圳" if symbol.startswith('0') or symbol.startswith('3') else "上海",
                "market_cap": round(current_price * random.uniform(50, 500), 2)
            },
            "financial_data": financial_data,
            "valuation_analysis": {
                "overall_valuation": valuation,
                "target_price": target_price,
                "upside_potential": f"{upside_potential}%"
            },
            "growth_analysis": {
                "growth_level": growth_level,
                "revenue_growth": f"{revenue_growth}%",
                "profit_growth": f"{profit_growth}%",
                "growth_quality": "优秀" if revenue_growth > 15 else "良好",
                "sustainability": "强" if profit_growth > 20 else "中等"
            },
            "profitability_analysis": {
                "roe_level": roe_level,
                "profit_margin": round(random.uniform(10, 30), 2),
                "asset_turnover": round(random.uniform(0.5, 1.5), 2)
            },
            "financial_health": {
                "health_level": health_level,
                "debt_ratio": f"{debt_ratio}%",
                "current_ratio": current_ratio,
                "health_score": health_score
            },
            "industry_analysis": {
                "industry_name": industry_info['industry'],
                "industry_trend": industry_trend,
                "market_position": "行业龙头" if symbol in ['000001', '600036', '600519'] else "行业领先",
                "market_share": f"{market_share}%"
            },
            "investment_highlights": highlights,
            "risk_factors": risks
        }

    def _get_comprehensive_analysis(self, technical_data: dict, fundamental_data: dict, current_price: float) -> dict:
        """生成综合分析，结合技术面、基本面、资金面、江恩线等多维度分析"""

        # 1. 技术面评分 (25分)
        technical_score = self._calculate_technical_score(technical_data)

        # 2. 基本面评分 (25分)
        fundamental_score = self._calculate_fundamental_score(fundamental_data)

        # 3. 资金面评分 (25分) - 基于量能和换手率
        capital_score = self._calculate_capital_score(technical_data)

        # 4. 江恩线评分 (25分) - 基于江恩线分析
        gann_score = self._calculate_gann_score(technical_data)

        # 综合得分
        comprehensive_score = technical_score + fundamental_score + capital_score + gann_score

        # 综合评级
        if comprehensive_score >= 85:
            comprehensive_rating = "强烈推荐"
            rating_color = "excellent"
        elif comprehensive_score >= 75:
            comprehensive_rating = "推荐"
            rating_color = "good"
        elif comprehensive_score >= 65:
            comprehensive_rating = "中性"
            rating_color = "neutral"
        elif comprehensive_score >= 55:
            comprehensive_rating = "谨慎"
            rating_color = "caution"
        else:
            comprehensive_rating = "不推荐"
            rating_color = "poor"

        # 操作建议
        if comprehensive_score >= 85:
            operation_advice = "积极买入"
            advice_reason = "技术面、基本面、资金面、江恩线等多维度分析均表现优异"
        elif comprehensive_score >= 75:
            operation_advice = "适量买入"
            advice_reason = "多数维度表现良好，适合中长期投资"
        elif comprehensive_score >= 65:
            operation_advice = "观望"
            advice_reason = "各维度表现一般，建议等待更好时机"
        elif comprehensive_score >= 55:
            operation_advice = "减仓"
            advice_reason = "多个维度存在风险，建议降低仓位"
        else:
            operation_advice = "卖出"
            advice_reason = "综合分析显示较大风险，建议及时止损"

        # 各维度优劣势分析
        strengths = []
        weaknesses = []

        if technical_score >= 20:
            strengths.append("技术面表现强劲")
        elif technical_score <= 15:
            weaknesses.append("技术面偏弱")

        if fundamental_score >= 20:
            strengths.append("基本面扎实")
        elif fundamental_score <= 15:
            weaknesses.append("基本面存在问题")

        if capital_score >= 20:
            strengths.append("资金面活跃")
        elif capital_score <= 15:
            weaknesses.append("资金面不足")

        if gann_score >= 20:
            strengths.append("江恩线支撑良好")
        elif gann_score <= 15:
            weaknesses.append("江恩线压力较大")

        return {
            "comprehensive_score": comprehensive_score,
            "comprehensive_rating": comprehensive_rating,
            "rating_color": rating_color,
            "operation_advice": operation_advice,
            "advice_reason": advice_reason,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "score_breakdown": {
                "technical_score": technical_score,
                "fundamental_score": fundamental_score,
                "capital_score": capital_score,
                "gann_score": gann_score
            },
            "analysis_dimensions": {
                "technical_analysis": "技术指标综合评估",
                "fundamental_analysis": "基本面财务分析",
                "capital_analysis": "资金流向和成交活跃度",
                "gann_analysis": "江恩线时间价格关系"
            }
        }

    def _calculate_technical_score(self, technical_data: dict) -> int:
        """计算技术面评分 (满分25分)"""
        score = 0

        try:
            # MACD评分 (5分)
            macd = technical_data.get('macd', {})
            if macd.get('signal') == 'bullish':
                score += 5
            elif macd.get('signal') == 'neutral':
                score += 3
            else:
                score += 1

            # RSI评分 (5分)
            rsi = technical_data.get('rsi', {})
            rsi_value = rsi.get('value', 50)
            if 30 <= rsi_value <= 70:  # 正常区间
                score += 5
            elif 20 <= rsi_value <= 80:  # 可接受区间
                score += 3
            else:  # 超买超卖
                score += 1

            # KDJ评分 (5分)
            kdj = technical_data.get('kdj', {})
            if kdj.get('signal') == 'bullish':
                score += 5
            elif kdj.get('signal') == 'neutral':
                score += 3
            else:
                score += 1

            # 布林带评分 (5分)
            boll = technical_data.get('boll', {})
            position = boll.get('position', 'middle')
            if position == 'middle':
                score += 5
            elif position in ['upper_middle', 'lower_middle']:
                score += 3
            else:
                score += 1

            # 移动平均线评分 (5分)
            ma = technical_data.get('ma', {})
            trend = ma.get('trend', 'neutral')
            if trend == 'bullish':
                score += 5
            elif trend == 'neutral':
                score += 3
            else:
                score += 1

        except Exception as e:
            logger.error(f"Technical score calculation error: {e}")
            score = 12  # 默认中等分数

        return min(score, 25)  # 确保不超过25分

    def _calculate_fundamental_score(self, fundamental_data: dict) -> int:
        """计算基本面评分 (满分25分)"""
        score = 0

        try:
            # 估值评分 (5分)
            valuation = fundamental_data.get('valuation_analysis', {}).get('overall_valuation', '合理')
            if valuation == '低估':
                score += 5
            elif valuation == '合理':
                score += 4
            else:
                score += 2

            # 成长性评分 (5分)
            growth = fundamental_data.get('growth_analysis', {}).get('growth_level', '稳定增长')
            if growth == '高速增长':
                score += 5
            elif growth == '稳定增长':
                score += 4
            else:
                score += 2

            # 盈利能力评分 (5分)
            roe = fundamental_data.get('profitability_analysis', {}).get('roe_level', '良好')
            if roe == '优秀':
                score += 5
            elif roe == '良好':
                score += 4
            else:
                score += 2

            # 财务健康评分 (5分)
            health = fundamental_data.get('financial_health', {}).get('health_level', '良好')
            if health == '优秀':
                score += 5
            elif health == '良好':
                score += 4
            else:
                score += 2

            # 行业前景评分 (5分)
            industry = fundamental_data.get('industry_analysis', {}).get('industry_trend', '稳定')
            if industry == '上升':
                score += 5
            elif industry == '稳定':
                score += 3
            else:
                score += 1

        except Exception as e:
            logger.error(f"Fundamental score calculation error: {e}")
            score = 15  # 默认中等分数

        return min(score, 25)  # 确保不超过25分

    def _calculate_capital_score(self, technical_data: dict) -> int:
        """计算资金面评分 (满分25分)"""
        score = 0

        try:
            # 成交量评分 (10分)
            volume = technical_data.get('volume_analysis', {})
            volume_trend = volume.get('trend', 'neutral')
            if volume_trend == 'increasing':
                score += 10
            elif volume_trend == 'stable':
                score += 6
            else:
                score += 3

            # 换手率评分 (10分)
            turnover = technical_data.get('turnover_rate', {})
            turnover_level = turnover.get('level', '正常')
            if turnover_level == '活跃':
                score += 10
            elif turnover_level == '正常':
                score += 7
            else:
                score += 4

            # 资金流向评分 (5分)
            # 基于价量关系判断
            if volume_trend == 'increasing' and technical_data.get('ma', {}).get('trend') == 'bullish':
                score += 5  # 量价齐升
            elif volume_trend == 'stable':
                score += 3
            else:
                score += 1

        except Exception as e:
            logger.error(f"Capital score calculation error: {e}")
            score = 15  # 默认中等分数

        return min(score, 25)  # 确保不超过25分

    def _calculate_gann_score(self, technical_data: dict) -> int:
        """计算江恩线评分 (满分25分)"""
        score = 0

        try:
            # 江恩线支撑阻力评分 (15分)
            gann = technical_data.get('gann_lines', {})
            support_level = gann.get('support_level', '中等')
            if support_level == '强':
                score += 15
            elif support_level == '中等':
                score += 10
            else:
                score += 5

            # 时间价格关系评分 (10分)
            time_price_relation = gann.get('time_price_relation', '正常')
            if time_price_relation == '良好':
                score += 10
            elif time_price_relation == '正常':
                score += 7
            else:
                score += 3

        except Exception as e:
            logger.error(f"Gann score calculation error: {e}")
            score = 15  # 默认中等分数

        return min(score, 25)  # 确保不超过25分

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
