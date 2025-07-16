"""
股票分析相关的数据模型
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class StockAnalysisRequest(BaseModel):
    """股票分析请求模型"""
    symbol: str
    period: str = "1y"


class BacktestRequest(BaseModel):
    """回测请求模型"""
    symbol: str
    strategy: str = "ma_cross"
    days: int = 100


class AlertRequest(BaseModel):
    """预警请求模型"""
    symbol: str
    condition: str  # price_above, price_below, etc.
    value: float
    message: str = ""


class WatchlistRequest(BaseModel):
    """自选股请求模型"""
    symbol: str
    name: str


class TechnicalIndicators(BaseModel):
    """技术指标模型"""
    macd: Dict[str, Any]
    kdj: Dict[str, Any]
    rsi: Dict[str, Any]
    boll: Dict[str, Any]
    wr: Dict[str, Any]
    gann: Dict[str, Any]
    ma: Dict[str, Any]
    volume: Dict[str, Any]
    turnover_rate: Dict[str, Any]  # 换手率分析
    elliott_wave: Dict[str, Any]   # 艾略特波浪理论分析


class StockAnalysisResponse(BaseModel):
    """股票分析响应模型"""
    symbol: str
    name: str
    current_price: float
    change_percent: float
    analysis: Dict[str, Any]  # 支持技术分析和基本面分析的组合数据
    signals: Dict[str, Any]   # 支持多种信号类型
    recommendation: str


class BacktestTrade(BaseModel):
    """回测交易记录模型"""
    type: str
    price: float
    ma5: float
    ma20: float
    profit: float


class BacktestResponse(BaseModel):
    """回测响应模型"""
    symbol: str
    strategy: str
    period_days: int
    total_trades: int
    win_rate: int
    total_return: float
    avg_return_per_trade: float
    summary: str
    trades: List[BacktestTrade]
    backtest_id: str
    status: str


class AlertRule(BaseModel):
    """预警规则模型"""
    id: int
    symbol: str
    name: str
    type: str
    target_price: float
    current_price: float
    status: str
    message: str = ""
    created_at: str


class WatchlistItem(BaseModel):
    """自选股项目模型"""
    symbol: str
    name: str
    price: float
    change: float


class StockData(BaseModel):
    """股票数据模型"""
    name: str
    current_price: float
    change_percent: float


class CompanyInfo(BaseModel):
    """公司基本信息模型"""
    symbol: str
    name: str
    full_name: str = ""
    industry: str = ""
    sector: str = ""
    market: str = ""
    listing_date: str = ""
    total_shares: float = 0.0
    market_cap: float = 0.0
    description: str = ""
    main_business: str = ""
    website: str = ""
    address: str = ""


class FinancialData(BaseModel):
    """财务数据模型"""
    revenue: float = 0.0  # 营业收入
    net_profit: float = 0.0  # 净利润
    gross_profit_margin: float = 0.0  # 毛利率
    net_profit_margin: float = 0.0  # 净利率
    roe: float = 0.0  # 净资产收益率
    roa: float = 0.0  # 总资产收益率
    debt_ratio: float = 0.0  # 资产负债率
    current_ratio: float = 0.0  # 流动比率
    quick_ratio: float = 0.0  # 速动比率
    eps: float = 0.0  # 每股收益
    bps: float = 0.0  # 每股净资产
    pe_ratio: float = 0.0  # 市盈率
    pb_ratio: float = 0.0  # 市净率
    ps_ratio: float = 0.0  # 市销率
    dividend_yield: float = 0.0  # 股息率
    year: str = ""
    quarter: str = ""


class IndustryAnalysis(BaseModel):
    """行业分析模型"""
    industry_name: str
    industry_code: str = ""
    industry_pe: float = 0.0  # 行业平均市盈率
    industry_pb: float = 0.0  # 行业平均市净率
    industry_growth: float = 0.0  # 行业增长率
    market_position: str = ""  # 市场地位
    competitive_advantage: List[str] = []  # 竞争优势
    industry_outlook: str = ""  # 行业前景
    major_competitors: List[str] = []  # 主要竞争对手


class FundamentalAnalysis(BaseModel):
    """基本面分析模型"""
    company_info: CompanyInfo
    financial_data: FinancialData
    industry_analysis: IndustryAnalysis
    valuation_analysis: Dict[str, Any]
    growth_analysis: Dict[str, Any]
    profitability_analysis: Dict[str, Any]
    financial_health: Dict[str, Any]
    investment_highlights: List[str]
    risk_factors: List[str]
    analyst_rating: str = "持有"  # 分析师评级


class EnhancedStockAnalysisResponse(BaseModel):
    """增强版股票分析响应模型"""
    symbol: str
    name: str
    current_price: float
    change_percent: float
    technical_analysis: TechnicalIndicators
    fundamental_analysis: FundamentalAnalysis
    signals: Dict[str, List[str]]
    technical_recommendation: str
    fundamental_recommendation: str
    overall_recommendation: str
