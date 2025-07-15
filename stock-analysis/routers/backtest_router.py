"""
回测相关路由
"""
from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import BacktestRequest, BacktestResponse
from services.backtest_service import BacktestService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
backtest_service = BacktestService()


@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    """运行策略回测"""
    try:
        logger.info(f"Running backtest for {request.symbol} with strategy {request.strategy}")
        
        result = backtest_service.run_backtest(request)
        
        logger.info(f"Backtest completed for {request.symbol}")
        return result
        
    except Exception as e:
        logger.error(f"Backtest error: {e}")
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")
