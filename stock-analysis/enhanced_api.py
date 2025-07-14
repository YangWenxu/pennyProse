from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import uvicorn
import requests
import json

# 尝试导入efinance
try:
    import efinance as ef
    EFINANCE_AVAILABLE = True
except ImportError:
    EFINANCE_AVAILABLE = False

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Enhanced Stock Analysis API", version="2.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 简单的内存存储（生产环境应使用数据库）
watchlist = []  # 自选股列表
alert_rules = []  # 预警规则
backtest_results = {}  # 回测结果缓存

class StockAnalysisRequest(BaseModel):
    symbol: str
    period: Optional[str] = "1"

class StockAnalysisResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    change_percent: float
    analysis: Dict[str, Any]
    fundamentals: Dict[str, Any]  # 基本面分析
    signals: Dict[str, Any]
    recommendation: str
    data_source: str
    last_update: str
    market_status: str  # 'open', 'closed', 'unknown'

def get_current_market_time():
    """获取当前市场时间信息"""
    now = datetime.now()
    # 简化的市场时间判断（A股交易时间）
    weekday = now.weekday()  # 0=Monday, 6=Sunday
    hour = now.hour
    minute = now.minute
    
    if weekday >= 5:  # 周末
        return "closed"
    elif (9 <= hour < 11) or (hour == 11 and minute <= 30) or (13 <= hour < 15):
        return "open"
    else:
        return "closed"

def fetch_real_stock_data_enhanced(symbol):
    """增强的股票数据获取"""
    data_sources_tried = []
    
    # 方法1: 使用efinance
    if EFINANCE_AVAILABLE:
        try:
            data_sources_tried.append("efinance")
            logger.info(f"Trying efinance for {symbol}")
            
            # 获取实时行情
            stock_info = ef.stock.get_realtime_quotes(symbol)
            if not stock_info.empty:
                stock_name = stock_info.iloc[0]['股票名称']
                current_price = float(stock_info.iloc[0]['最新价'])
                change_percent = float(stock_info.iloc[0]['涨跌幅'])
                
                # 获取历史数据
                end_date = datetime.now().strftime('%Y%m%d')
                start_date = (datetime.now() - timedelta(days=100)).strftime('%Y%m%d')
                
                hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
                if not hist_data.empty:
                    prices = hist_data['收盘'].values.astype(float)
                    high = hist_data['最高'].values.astype(float)
                    low = hist_data['最低'].values.astype(float)
                    volume = hist_data['成交量'].values.astype(float)
                    
                    logger.info(f"Successfully fetched real data via efinance for {symbol}")
                    return {
                        'success': True,
                        'source': 'efinance',
                        'name': stock_name,
                        'current_price': current_price,
                        'change_percent': change_percent,
                        'prices': prices,
                        'high': high,
                        'low': low,
                        'volume': volume
                    }
        except Exception as e:
            logger.warning(f"efinance failed for {symbol}: {e}")
    
    # 方法2: 使用模拟但更真实的数据
    logger.info(f"Using enhanced simulation for {symbol}")
    return generate_enhanced_simulation(symbol, data_sources_tried)

def generate_enhanced_simulation(symbol, sources_tried):
    """生成增强的模拟数据"""
    np.random.seed(hash(symbol) % 2**32)

    # 根据股票代码生成更真实的基础数据
    if symbol.startswith('00'):  # 深市
        base_price = 8 + (hash(symbol) % 30)
        volatility = 0.025
        sector = 'banking' if symbol in ['000001', '000002'] else 'consumer'
    elif symbol.startswith('60'):  # 沪市
        base_price = 12 + (hash(symbol) % 40)
        volatility = 0.02
        sector = 'finance' if symbol in ['600000', '600036'] else 'liquor' if symbol == '600519' else 'industrial'
    elif symbol.startswith('30'):  # 创业板
        base_price = 15 + (hash(symbol) % 60)
        volatility = 0.035
        sector = 'technology'
    else:
        base_price = 10 + (hash(symbol) % 50)
        volatility = 0.025
        sector = 'mixed'
    
    # 生成更真实的价格走势
    days = 100
    prices = []
    current_price = base_price
    
    # 添加一些趋势性
    trend = np.random.choice([-1, 0, 1], p=[0.3, 0.4, 0.3])  # 下跌、震荡、上涨
    
    for i in range(days):
        # 基础随机变化
        daily_change = np.random.normal(0, volatility)
        
        # 添加趋势影响
        trend_influence = trend * 0.001 * (i / days)
        
        # 添加一些技术面影响
        if i > 20:
            ma20 = np.mean(prices[-20:])
            if current_price > ma20 * 1.05:  # 远离均线时回归
                daily_change -= 0.01
            elif current_price < ma20 * 0.95:
                daily_change += 0.01
        
        current_price = current_price * (1 + daily_change + trend_influence)
        prices.append(current_price)
    
    prices = np.array(prices)
    
    # 生成高低价（更真实的日内波动）
    daily_volatility = volatility * 0.5
    high = prices * (1 + np.random.uniform(0, daily_volatility, days))
    low = prices * (1 - np.random.uniform(0, daily_volatility, days))
    
    # 生成成交量（与价格变化相关）
    price_changes = np.diff(prices, prepend=prices[0])
    volume_base = 800000 + (hash(symbol) % 1000000)
    volume = []
    
    for i, change in enumerate(price_changes):
        # 价格变化大时成交量增加
        volume_multiplier = 1 + abs(change / prices[i]) * 5
        daily_volume = volume_base * volume_multiplier * np.random.uniform(0.5, 1.5)
        volume.append(daily_volume)
    
    volume = np.array(volume)
    
    # 计算当前涨跌幅
    change_percent = ((prices[-1] - prices[-2]) / prices[-2]) * 100 if len(prices) > 1 else 0
    
    # 生成股票名称和详细信息
    stock_info = {
        '000001': {
            'name': '平安银行',
            'full_name': '平安银行股份有限公司',
            'description': '中国领先的股份制商业银行，主营银行业务，包括公司银行业务、零售银行业务和金融市场业务。',
            'main_business': '银行业务、信贷投放、资产管理',
            'competitive_advantage': '科技金融创新、零售银行转型、风险管控能力',
            'listing_date': '1991-04-03'
        },
        '000002': {
            'name': '万科A',
            'full_name': '万科企业股份有限公司',
            'description': '中国领先的房地产开发企业，专注于住宅开发、商业地产和物业服务。',
            'main_business': '房地产开发、物业服务、商业运营',
            'competitive_advantage': '品牌影响力、开发经验、全国化布局',
            'listing_date': '1991-01-29'
        },
        '000858': {
            'name': '五粮液',
            'full_name': '宜宾五粮液股份有限公司',
            'description': '中国著名白酒生产企业，以五粮液品牌为核心的高端白酒制造商。',
            'main_business': '白酒生产销售、品牌运营',
            'competitive_advantage': '品牌价值、渠道网络、工艺传承',
            'listing_date': '1998-04-27'
        },
        '600000': {
            'name': '浦发银行',
            'full_name': '上海浦东发展银行股份有限公司',
            'description': '总部位于上海的全国性股份制商业银行，业务覆盖公司银行、零售银行和金融市场。',
            'main_business': '银行业务、投资银行、资产管理',
            'competitive_advantage': '区位优势、公司银行业务、金融创新',
            'listing_date': '1999-11-10'
        },
        '600036': {
            'name': '招商银行',
            'full_name': '招商银行股份有限公司',
            'description': '中国领先的零售银行，以"因您而变"的服务理念著称，金融科技创新领先。',
            'main_business': '零售银行、公司银行、金融科技',
            'competitive_advantage': '零售银行领先、金融科技、客户体验',
            'listing_date': '2002-04-09'
        },
        '600519': {
            'name': '贵州茅台',
            'full_name': '贵州茅台酒股份有限公司',
            'description': '中国最著名的白酒企业，茅台酒享有"国酒"美誉，是高端白酒市场的绝对龙头。',
            'main_business': '茅台酒生产销售、系列酒开发',
            'competitive_advantage': '品牌价值、稀缺性、文化底蕴',
            'listing_date': '2001-08-27'
        },
        '300015': {
            'name': '爱尔眼科',
            'full_name': '爱尔眼科医院集团股份有限公司',
            'description': '中国最大的眼科医疗连锁机构，专注于眼科医疗服务和视光服务。',
            'main_business': '眼科医疗服务、视光服务、医疗器械',
            'competitive_advantage': '连锁规模、专业技术、品牌影响力',
            'listing_date': '2009-10-30'
        },
        '300059': {
            'name': '东方财富',
            'full_name': '东方财富信息股份有限公司',
            'description': '中国领先的互联网金融信息服务提供商，旗下拥有东方财富网、天天基金网等平台。',
            'main_business': '金融信息服务、基金销售、证券业务',
            'competitive_advantage': '流量优势、平台生态、数据服务',
            'listing_date': '2010-03-19'
        },
        '002415': {
            'name': '海康威视',
            'full_name': '杭州海康威视数字技术股份有限公司',
            'description': '全球领先的以视频为核心的智能物联网解决方案和大数据服务提供商。',
            'main_business': '视频监控设备、智能安防、物联网解决方案',
            'competitive_advantage': '技术领先、全球布局、产业链完整',
            'listing_date': '2010-05-20'
        },
        '000858': {
            'name': '五粮液',
            'full_name': '宜宾五粮液股份有限公司',
            'description': '中国著名白酒生产企业，以五粮液品牌为核心的高端白酒制造商。',
            'main_business': '白酒生产销售、品牌运营',
            'competitive_advantage': '品牌价值、渠道网络、工艺传承',
            'listing_date': '1998-04-27'
        },
        '002594': {
            'name': '比亚迪',
            'full_name': '比亚迪股份有限公司',
            'description': '全球新能源汽车领导者，业务涵盖汽车、电池、电子等多个领域。',
            'main_business': '新能源汽车、动力电池、电子产品',
            'competitive_advantage': '垂直整合、技术创新、产业链优势',
            'listing_date': '2011-06-30'
        },
        '000568': {
            'name': '泸州老窖',
            'full_name': '泸州老窖股份有限公司',
            'description': '中国四大名酒之一，拥有400多年酿酒历史的白酒企业。',
            'main_business': '白酒生产销售、文化传承',
            'competitive_advantage': '历史底蕴、工艺传承、品牌价值',
            'listing_date': '1994-05-09'
        },
        '300750': {
            'name': '宁德时代',
            'full_name': '宁德时代新能源科技股份有限公司',
            'description': '全球领先的动力电池系统提供商，专注于新能源汽车动力电池系统。',
            'main_business': '动力电池系统、储能系统、电池回收',
            'competitive_advantage': '技术领先、规模优势、客户资源',
            'listing_date': '2018-06-11'
        }
    }

    stock_data = stock_info.get(symbol, {
        'name': f"股票{symbol}",
        'full_name': f"股票{symbol}有限公司",
        'description': f"这是一只代码为{symbol}的股票，具体业务信息待完善。",
        'main_business': '待完善',
        'competitive_advantage': '待分析',
        'listing_date': '1990-01-01'
    })

    stock_name = stock_data['name']
    
    return {
        'success': True,
        'source': f'enhanced_simulation (tried: {", ".join(sources_tried) if sources_tried else "none"})',
        'name': stock_name,
        'current_price': current_price,
        'change_percent': change_percent,
        'prices': prices,
        'high': high,
        'low': low,
        'volume': volume,
        'sector': sector,
        'symbol': symbol,
        'stock_info': stock_data
    }

def generate_fundamentals_analysis(symbol, sector, current_price, prices, stock_info):
    """生成基本面分析数据"""
    np.random.seed(hash(symbol) % 2**32)

    # 行业信息
    sector_info = {
        'banking': {'name': '银行业', 'avg_pe': 6.5, 'avg_pb': 0.8, 'dividend_yield': 4.5},
        'finance': {'name': '金融业', 'avg_pe': 8.2, 'avg_pb': 1.1, 'dividend_yield': 3.8},
        'liquor': {'name': '白酒业', 'avg_pe': 25.0, 'avg_pb': 8.5, 'dividend_yield': 2.1},
        'technology': {'name': '科技业', 'avg_pe': 35.0, 'avg_pb': 4.2, 'dividend_yield': 1.2},
        'consumer': {'name': '消费业', 'avg_pe': 18.5, 'avg_pb': 2.8, 'dividend_yield': 2.8},
        'industrial': {'name': '工业', 'avg_pe': 15.2, 'avg_pb': 1.8, 'dividend_yield': 3.2},
        'mixed': {'name': '综合', 'avg_pe': 20.0, 'avg_pb': 2.5, 'dividend_yield': 2.5}
    }

    sector_data = sector_info.get(sector, sector_info['mixed'])

    # 生成基本面数据
    base_eps = current_price / (sector_data['avg_pe'] * (0.8 + np.random.random() * 0.4))
    base_bvps = current_price / (sector_data['avg_pb'] * (0.8 + np.random.random() * 0.4))

    # 财务指标
    pe_ratio = current_price / base_eps
    pb_ratio = current_price / base_bvps
    roe = (base_eps / base_bvps) * 100

    # 营收和利润增长率（基于价格趋势）
    price_trend = (prices[-1] - prices[-20]) / prices[-20] if len(prices) >= 20 else 0
    revenue_growth = 5 + price_trend * 50 + np.random.normal(0, 5)
    profit_growth = revenue_growth * (0.8 + np.random.random() * 0.4)

    # 股息率
    dividend_yield = sector_data['dividend_yield'] * (0.7 + np.random.random() * 0.6)

    # 市值（亿元）
    shares_outstanding = 10 + (hash(symbol) % 50)  # 10-60亿股
    market_cap = (current_price * shares_outstanding) / 100  # 转换为亿元

    # 行业排名（模拟）
    industry_rank = 1 + (hash(symbol) % 20)  # 1-20名

    # 机构持股比例
    institutional_holding = 30 + (hash(symbol) % 40)  # 30-70%

    # 基本面评分
    fundamentals_score = 0

    # PE估值评分
    if pe_ratio < sector_data['avg_pe'] * 0.8:
        fundamentals_score += 2
    elif pe_ratio < sector_data['avg_pe']:
        fundamentals_score += 1
    elif pe_ratio > sector_data['avg_pe'] * 1.5:
        fundamentals_score -= 1

    # 成长性评分
    if profit_growth > 20:
        fundamentals_score += 2
    elif profit_growth > 10:
        fundamentals_score += 1
    elif profit_growth < 0:
        fundamentals_score -= 2

    # ROE评分
    if roe > 15:
        fundamentals_score += 2
    elif roe > 10:
        fundamentals_score += 1
    elif roe < 5:
        fundamentals_score -= 1

    return {
        # 基本信息
        'company_name': stock_info['name'],
        'full_name': stock_info['full_name'],
        'description': stock_info['description'],
        'main_business': stock_info['main_business'],
        'competitive_advantage': stock_info['competitive_advantage'],
        'listing_date': stock_info['listing_date'],

        # 财务指标
        'sector': sector_data['name'],
        'market_cap': round(market_cap, 2),
        'pe_ratio': round(pe_ratio, 2),
        'pb_ratio': round(pb_ratio, 2),
        'roe': round(roe, 2),
        'eps': round(base_eps, 2),
        'bvps': round(base_bvps, 2),
        'revenue_growth': round(revenue_growth, 2),
        'profit_growth': round(profit_growth, 2),
        'dividend_yield': round(dividend_yield, 2),
        'shares_outstanding': round(shares_outstanding, 2),
        'industry_rank': industry_rank,
        'institutional_holding': round(institutional_holding, 1),
        'fundamentals_score': fundamentals_score,
        'valuation': 'undervalued' if pe_ratio < sector_data['avg_pe'] * 0.9 else 'overvalued' if pe_ratio > sector_data['avg_pe'] * 1.2 else 'fair',
        'growth_stage': 'high_growth' if profit_growth > 20 else 'stable_growth' if profit_growth > 5 else 'slow_growth' if profit_growth > 0 else 'declining'
    }

def calculate_gann_lines(prices, high, low):
    """计算江恩线"""
    if len(prices) < 20:
        return {
            'gann_1x1': prices[-1],
            'gann_2x1': prices[-1] * 1.05,
            'gann_1x2': prices[-1] * 0.95,
            'trend': 'neutral',
            'support_level': prices[-1] * 0.95,
            'resistance_level': prices[-1] * 1.05,
            'angle': 45
        }

    # 找到重要的高点和低点
    recent_high = np.max(high[-20:])
    recent_low = np.min(low[-20:])
    current_price = prices[-1]

    # 计算时间和价格的比例关系
    time_span = 20  # 20个交易日
    price_span = recent_high - recent_low

    # 江恩角度线计算
    # 1x1线：时间和价格等比例变化
    gann_1x1 = recent_low + (price_span * 0.5)

    # 2x1线：价格变化是时间的2倍
    gann_2x1 = recent_low + (price_span * 0.75)

    # 1x2线：时间变化是价格的2倍
    gann_1x2 = recent_low + (price_span * 0.25)

    # 判断趋势
    if current_price > gann_1x1:
        if current_price > gann_2x1:
            trend = 'strong_bullish'
            angle = 63.75  # 2x1角度
        else:
            trend = 'bullish'
            angle = 45  # 1x1角度
    elif current_price > gann_1x2:
        trend = 'neutral'
        angle = 26.25  # 1x2角度
    else:
        trend = 'bearish'
        angle = 18.75

    # 支撑和阻力位
    if trend in ['bullish', 'strong_bullish']:
        support_level = gann_1x1
        resistance_level = recent_high
    else:
        support_level = recent_low
        resistance_level = gann_1x1

    return {
        'gann_1x1': round(gann_1x1, 2),
        'gann_2x1': round(gann_2x1, 2),
        'gann_1x2': round(gann_1x2, 2),
        'trend': trend,
        'support_level': round(support_level, 2),
        'resistance_level': round(resistance_level, 2),
        'angle': angle,
        'recent_high': round(recent_high, 2),
        'recent_low': round(recent_low, 2)
    }

def calculate_all_technical_indicators(prices, high, low, volume):
    """计算完整的技术指标"""
    # 移动平均线
    ma5 = calculate_sma(prices, 5)
    ma10 = calculate_sma(prices, 10)
    ma20 = calculate_sma(prices, 20)
    ma60 = calculate_sma(prices, 60)

    # MACD
    macd_analysis = calculate_macd(prices)

    # RSI
    rsi_analysis = calculate_rsi(prices)

    # KDJ
    kdj_analysis = calculate_kdj(high, low, prices)

    # 布林带
    boll_analysis = calculate_bollinger_bands(prices)

    # 威廉指标
    wr_analysis = calculate_williams_r(high, low, prices)

    # 量能分析
    volume_analysis = calculate_volume_analysis(volume, prices)

    # 江恩线
    gann_analysis = calculate_gann_lines(prices, high, low)

    return {
        'macd': macd_analysis,
        'kdj': kdj_analysis,
        'ma': {
            'ma5': float(ma5[-1]) if not np.isnan(ma5[-1]) else prices[-1],
            'ma10': float(ma10[-1]) if not np.isnan(ma10[-1]) else prices[-1],
            'ma20': float(ma20[-1]) if not np.isnan(ma20[-1]) else prices[-1],
            'ma60': float(ma60[-1]) if not np.isnan(ma60[-1]) else prices[-1],
            'bullish_alignment': bool(ma5[-1] > ma10[-1] > ma20[-1] > ma60[-1]) if all(not np.isnan(x[-1]) for x in [ma5, ma10, ma20, ma60]) else False,
            'cross_signal': get_ma_cross_signal(ma5, ma20),
            'above_ma20': bool(prices[-1] > ma20[-1]) if not np.isnan(ma20[-1]) else True
        },
        'volume': volume_analysis,
        'rsi': rsi_analysis,
        'boll': boll_analysis,
        'wr': wr_analysis,
        'gann': gann_analysis
    }

# 这里需要添加所有技术指标计算函数
def calculate_sma(prices, period):
    """计算简单移动平均线"""
    if len(prices) < period:
        return np.full(len(prices), np.nan)
    
    sma = np.full(len(prices), np.nan)
    for i in range(period-1, len(prices)):
        sma[i] = np.mean(prices[i-period+1:i+1])
    return sma

def calculate_macd(prices, fast=12, slow=26, signal=9):
    """计算MACD"""
    if len(prices) < slow:
        return {'macd': 0, 'signal': 0, 'histogram': 0, 'trend': 'neutral'}
    
    ema_fast = calculate_ema(prices, fast)
    ema_slow = calculate_ema(prices, slow)
    macd_line = ema_fast - ema_slow
    signal_line = calculate_ema(macd_line, signal)
    histogram = macd_line - signal_line
    
    return {
        'macd': float(macd_line[-1]),
        'signal': float(signal_line[-1]),
        'histogram': float(histogram[-1]),
        'trend': 'bullish' if macd_line[-1] > signal_line[-1] else 'bearish'
    }

def calculate_ema(prices, period):
    """计算指数移动平均线"""
    ema = np.zeros(len(prices))
    ema[0] = prices[0]
    multiplier = 2 / (period + 1)
    
    for i in range(1, len(prices)):
        ema[i] = (prices[i] * multiplier) + (ema[i-1] * (1 - multiplier))
    
    return ema

# 添加其他技术指标的简化实现
def calculate_rsi(prices, period=14):
    """计算RSI"""
    if len(prices) < period + 1:
        return {'rsi': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    if avg_loss == 0:
        rsi = 100
    else:
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
    
    return {
        'rsi': float(rsi),
        'signal': 'overbought' if rsi > 70 else 'oversold' if rsi < 30 else 'neutral',
        'overbought': bool(rsi > 70),
        'oversold': bool(rsi < 30)
    }

def calculate_kdj(high, low, close, period=9):
    """计算KDJ"""
    if len(close) < period:
        return {'k': 50, 'd': 50, 'j': 50, 'signal': 'neutral', 'overbought': False, 'oversold': False}
    
    # 简化的KDJ计算
    lowest_low = np.min(low[-period:])
    highest_high = np.max(high[-period:])
    
    if highest_high == lowest_low:
        rsv = 50
    else:
        rsv = (close[-1] - lowest_low) / (highest_high - lowest_low) * 100
    
    # 简化的K、D值
    k = rsv * 0.6 + 50 * 0.4  # 简化计算
    d = k * 0.6 + 50 * 0.4
    j = 3 * k - 2 * d
    
    return {
        'k': float(k),
        'd': float(d),
        'j': float(j),
        'signal': 'golden_cross' if k > d else 'death_cross' if k < d else 'neutral',
        'overbought': bool(k > 80 and d > 80),
        'oversold': bool(k < 20 and d < 20)
    }

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """计算布林带"""
    if len(prices) < period:
        return {'upper': prices[-1] * 1.1, 'middle': prices[-1], 'lower': prices[-1] * 0.9, 'position': 'middle', 'squeeze': False, 'width': 0.1}
    
    sma = np.mean(prices[-period:])
    std = np.std(prices[-period:])
    
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    
    current_price = prices[-1]
    if current_price > upper:
        position = 'above_upper'
    elif current_price < lower:
        position = 'below_lower'
    elif current_price > sma:
        position = 'upper_half'
    else:
        position = 'lower_half'
    
    return {
        'upper': float(upper),
        'middle': float(sma),
        'lower': float(lower),
        'position': position,
        'squeeze': bool((upper - lower) / sma < 0.1),
        'width': float((upper - lower) / sma)
    }

def calculate_williams_r(high, low, close, period=14):
    """计算威廉指标"""
    if len(close) < period:
        return {'wr': -50, 'signal': 'neutral', 'overbought': False, 'oversold': False}
    
    highest_high = np.max(high[-period:])
    lowest_low = np.min(low[-period:])
    
    if highest_high == lowest_low:
        wr = -50
    else:
        wr = ((highest_high - close[-1]) / (highest_high - lowest_low)) * -100
    
    return {
        'wr': float(wr),
        'signal': 'overbought' if wr > -20 else 'oversold' if wr < -80 else 'neutral',
        'overbought': bool(wr > -20),
        'oversold': bool(wr < -80)
    }

def calculate_volume_analysis(volume, prices):
    """计算量能分析"""
    if len(volume) < 5:
        return {'current_volume': float(volume[-1]), 'volume_ma5': float(volume[-1]), 'volume_ma10': float(volume[-1]), 'volume_ratio': 1.0, 'volume_price_signal': 'neutral'}
    
    vol_ma5 = np.mean(volume[-5:])
    vol_ma10 = np.mean(volume[-10:]) if len(volume) >= 10 else vol_ma5
    
    price_up = len(prices) > 1 and prices[-1] > prices[-2]
    volume_up = volume[-1] > vol_ma5
    
    if price_up and volume_up:
        signal = 'bullish'
    elif not price_up and volume_up:
        signal = 'bearish'
    else:
        signal = 'neutral'
    
    return {
        'current_volume': float(volume[-1]),
        'volume_ma5': float(vol_ma5),
        'volume_ma10': float(vol_ma10),
        'volume_ratio': float(volume[-1] / vol_ma5),
        'volume_price_signal': signal
    }

def get_ma_cross_signal(ma5, ma20):
    """获取均线交叉信号"""
    if len(ma5) < 2 or len(ma20) < 2:
        return 'neutral'
    
    if np.isnan(ma5[-2]) or np.isnan(ma20[-2]) or np.isnan(ma5[-1]) or np.isnan(ma20[-1]):
        return 'neutral'
    
    if ma5[-2] <= ma20[-2] and ma5[-1] > ma20[-1]:
        return 'golden_cross'
    elif ma5[-2] >= ma20[-2] and ma5[-1] < ma20[-1]:
        return 'death_cross'
    else:
        return 'neutral'

def generate_enhanced_recommendation(analysis, fundamentals):
    """生成增强的投资建议（技术面+基本面）"""
    technical_score = 0
    fundamental_score = fundamentals['fundamentals_score']
    signals = []

    # 技术面分析
    # MACD分析
    if analysis['macd']['trend'] == 'bullish':
        technical_score += 1
        signals.append("MACD呈多头趋势")

    # KDJ分析
    if analysis['kdj']['signal'] == 'golden_cross':
        technical_score += 2
        signals.append("KDJ金叉信号")
    elif analysis['kdj']['oversold']:
        technical_score += 1
        signals.append("KDJ超卖区域")
    elif analysis['kdj']['overbought']:
        technical_score -= 1
        signals.append("KDJ超买区域")

    # 均线分析
    if analysis['ma']['bullish_alignment']:
        technical_score += 2
        signals.append("均线多头排列")
    if analysis['ma']['cross_signal'] == 'golden_cross':
        technical_score += 2
        signals.append("均线金叉")
    elif analysis['ma']['cross_signal'] == 'death_cross':
        technical_score -= 2
        signals.append("均线死叉")

    # RSI分析
    if analysis['rsi']['oversold']:
        technical_score += 1
        signals.append("RSI超卖区域")
    elif analysis['rsi']['overbought']:
        technical_score -= 1
        signals.append("RSI超买区域")

    # 布林带分析
    if analysis['boll']['position'] == 'below_lower':
        technical_score += 1
        signals.append("价格跌破布林带下轨")
    elif analysis['boll']['position'] == 'above_upper':
        technical_score -= 1
        signals.append("价格突破布林带上轨")

    # 威廉指标分析
    if analysis['wr']['oversold']:
        technical_score += 1
        signals.append("威廉指标超卖")
    elif analysis['wr']['overbought']:
        technical_score -= 1
        signals.append("威廉指标超买")

    # 江恩线分析
    if analysis['gann']['trend'] == 'strong_bullish':
        technical_score += 2
        signals.append("江恩线强势上涨")
    elif analysis['gann']['trend'] == 'bullish':
        technical_score += 1
        signals.append("江恩线看涨")
    elif analysis['gann']['trend'] == 'bearish':
        technical_score -= 1
        signals.append("江恩线看跌")

    # 量能分析
    if analysis['volume']['volume_price_signal'] == 'bullish':
        technical_score += 1
        signals.append("量价配合良好")

    # 基本面分析信号
    if fundamentals['valuation'] == 'undervalued':
        signals.append("估值偏低")
    elif fundamentals['valuation'] == 'overvalued':
        signals.append("估值偏高")

    if fundamentals['growth_stage'] == 'high_growth':
        signals.append("高成长性")
    elif fundamentals['growth_stage'] == 'declining':
        signals.append("业绩下滑")

    if fundamentals['roe'] > 15:
        signals.append("ROE优秀")

    # 综合评分
    total_score = technical_score + fundamental_score

    if total_score >= 7:
        recommendation = "强烈买入"
    elif total_score >= 4:
        recommendation = "买入"
    elif total_score >= 0:
        recommendation = "持有"
    elif total_score >= -4:
        recommendation = "卖出"
    else:
        recommendation = "强烈卖出"

    return recommendation, signals

@app.get("/")
async def root():
    return {
        "message": "Enhanced Stock Analysis API is running",
        "version": "2.0.0",
        "efinance_available": EFINANCE_AVAILABLE,
        "current_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "market_status": get_current_market_time()
    }

@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    try:
        logger.info(f"Analyzing stock: {request.symbol}")
        
        # 获取股票数据
        stock_data = fetch_real_stock_data_enhanced(request.symbol)
        
        if not stock_data['success']:
            raise HTTPException(status_code=404, detail="Failed to fetch stock data")
        
        # 计算技术指标
        analysis = calculate_all_technical_indicators(
            stock_data['prices'],
            stock_data['high'],
            stock_data['low'],
            stock_data['volume']
        )

        # 生成基本面分析
        fundamentals = generate_fundamentals_analysis(
            stock_data['symbol'],
            stock_data['sector'],
            stock_data['current_price'],
            stock_data['prices'],
            stock_data['stock_info']
        )

        # 生成投资建议（技术面+基本面）
        recommendation, signals = generate_enhanced_recommendation(analysis, fundamentals)

        # 确定数据源类型
        data_source = "real" if "efinance" in stock_data['source'] else "simulated"

        return StockAnalysisResponse(
            symbol=request.symbol,
            name=stock_data['name'],
            current_price=round(stock_data['current_price'], 2),
            change_percent=round(stock_data['change_percent'], 2),
            analysis=analysis,
            fundamentals=fundamentals,
            signals={'signals': signals},
            recommendation=recommendation,
            data_source=data_source,
            last_update=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            market_status=get_current_market_time()
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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
async def create_alert(alert: dict):
    """创建预警规则"""
    try:
        alert_dict = alert.copy()
        alert_dict['id'] = len(alert_rules) + 1
        alert_dict['created_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        alert_dict['active'] = True
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
            if not alert.get('active', True):
                continue

            try:
                # 模拟检查预警条件
                # 在实际应用中，这里会获取真实的股票数据
                import random

                # 模拟当前价格
                current_price = 10 + random.uniform(-5, 5)

                # 检查预警条件
                triggered = False
                condition = alert.get('condition', '')
                value = float(alert.get('value', 0))

                if condition == 'price_above' and current_price > value:
                    triggered = True
                elif condition == 'price_below' and current_price < value:
                    triggered = True

                if triggered:
                    triggered_alerts.append({
                        'alert_id': alert['id'],
                        'symbol': alert['symbol'],
                        'message': alert['message'],
                        'current_price': round(current_price, 2),
                        'trigger_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })

            except Exception as e:
                logger.warning(f"Failed to check alert for {alert.get('symbol', 'unknown')}: {e}")
                continue

        return {"triggered_alerts": triggered_alerts}
    except Exception as e:
        logger.error(f"Check alerts error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check alerts")

# 历史数据API
@app.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: int = 30):
    """获取股票历史数据"""
    try:
        # 生成模拟历史数据
        np.random.seed(hash(symbol) % 2**32)

        history = []
        base_price = 10 + (hash(symbol) % 50)
        current_price = base_price

        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i-1)).strftime('%Y-%m-%d')

            # 生成OHLC数据
            change = np.random.normal(0, 0.02)
            current_price = current_price * (1 + change)

            daily_volatility = 0.01
            high = current_price * (1 + np.random.uniform(0, daily_volatility))
            low = current_price * (1 - np.random.uniform(0, daily_volatility))
            open_price = current_price * (1 + np.random.uniform(-daily_volatility/2, daily_volatility/2))
            close = current_price

            volume = np.random.uniform(500000, 2000000)

            history.append({
                'date': date,
                'open': round(open_price, 2),
                'high': round(high, 2),
                'low': round(low, 2),
                'close': round(close, 2),
                'volume': int(volume)
            })

        return {"symbol": symbol, "history": history}
    except Exception as e:
        logger.error(f"History error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history data")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
