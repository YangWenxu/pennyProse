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


class StockAnalysisResponse(BaseModel):
    """股票分析响应模型"""
    symbol: str
    name: str
    current_price: float
    change_percent: float
    analysis: TechnicalIndicators
    signals: Dict[str, List[str]]
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
