"""
策略回测服务
"""
import random
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import BacktestRequest, BacktestResponse, BacktestTrade
import logging

logger = logging.getLogger(__name__)


class BacktestService:
    """回测服务类"""
    
    def run_backtest(self, request: BacktestRequest) -> BacktestResponse:
        """运行策略回测"""
        try:
            symbol = request.symbol
            strategy = request.strategy
            days = request.days
            
            # 生成模拟回测结果
            total_trades = random.randint(8, 25)
            win_rate = random.randint(45, 75)  # 45-75%
            total_return = round(random.uniform(-15, 30), 2)  # -15% to +30%
            avg_return_per_trade = round(total_return / total_trades if total_trades > 0 else 0, 2)
            
            # 生成交易记录
            trades = self._generate_trades(min(8, total_trades))
            
            # 生成策略总结
            strategy_name = self._get_strategy_name(strategy)
            performance = self._get_performance_description(total_return)
            
            summary = (f"{symbol} 在过去{days}天的{strategy_name}回测中，"
                      f"共产生{total_trades}次交易信号。策略{performance}，"
                      f"胜率为{win_rate}%，总收益率为{total_return}%。"
                      f"建议结合市场环境和风险管理进行实际应用。")
            
            return BacktestResponse(
                symbol=symbol,
                strategy=strategy,
                period_days=days,
                total_trades=total_trades,
                win_rate=win_rate,
                total_return=float(total_return),
                avg_return_per_trade=float(avg_return_per_trade),
                summary=summary,
                trades=trades,
                backtest_id=f'bt_{random.randint(1000, 9999)}',
                status='completed'
            )
            
        except Exception as e:
            logger.error(f"Backtest error: {e}")
            raise Exception(f"Backtest failed: {str(e)}")
    
    def _generate_trades(self, count: int) -> List[BacktestTrade]:
        """生成交易记录"""
        trades = []
        for i in range(count):
            base_price = random.uniform(10, 50)
            trade = BacktestTrade(
                type='buy' if i % 2 == 0 else 'sell',
                price=round(base_price, 2),
                ma5=round(base_price * random.uniform(0.98, 1.02), 2),
                ma20=round(base_price * random.uniform(0.95, 1.05), 2),
                profit=round(random.uniform(-8, 12), 2)
            )
            trades.append(trade)
        return trades
    
    def _get_strategy_name(self, strategy: str) -> str:
        """获取策略中文名称"""
        strategy_names = {
            'ma_cross': '均线交叉策略',
            'rsi': 'RSI策略',
            'macd': 'MACD策略',
            'bollinger': '布林带策略'
        }
        return strategy_names.get(strategy, strategy)
    
    def _get_performance_description(self, total_return: float) -> str:
        """获取表现描述"""
        if total_return > 5:
            return '表现良好'
        elif total_return > -5:
            return '表现一般'
        else:
            return '表现较差'
