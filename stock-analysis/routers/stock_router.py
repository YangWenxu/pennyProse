"""
股票分析相关路由
"""
from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import StockAnalysisRequest, StockAnalysisResponse
from services.data_service import StockDataService
from services.analysis_service import StockAnalysisService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
data_service = StockDataService()
analysis_service = StockAnalysisService()


@router.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    """股票技术分析"""
    try:
        logger.info(f"Analyzing stock: {request.symbol}")
        
        # 获取股票基本信息
        stock_data = data_service.get_stock_info(request.symbol)
        
        if stock_data:
            stock_name = stock_data['name']
            current_price = stock_data['current_price']
            change_percent = stock_data['change_percent']
            use_mock_data = False
            logger.info(f"Got real data for {request.symbol}: {stock_name}")
        else:
            # 所有数据源都失败，使用模拟数据
            logger.warning(f"All data sources failed for {request.symbol}, using mock data")
            stock_name = f"模拟股票-{request.symbol}"
            current_price = 100.0
            change_percent = 0.5
            use_mock_data = True
        
        # 获取历史数据
        hist_data = None
        
        if not use_mock_data:
            hist_data = data_service.get_historical_data(request.symbol)
        
        # 如果没有获取到历史数据，使用模拟数据
        if hist_data is None or hist_data.empty:
            hist_data = data_service.generate_mock_data(request.symbol, current_price)
        
        # 执行技术分析
        analysis_result = analysis_service.analyze_stock(
            request.symbol, stock_name, current_price, change_percent, hist_data
        )
        
        logger.info(f"Analysis completed for {request.symbol}")
        return analysis_result
        
    except Exception as e:
        logger.error(f"Analysis error for {request.symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: int = 30):
    """获取股票历史数据"""
    try:
        hist_data = data_service.get_historical_data(symbol, days)
        
        if hist_data is None or hist_data.empty:
            # 使用模拟数据
            stock_data = data_service.get_stock_info(symbol)
            current_price = stock_data['current_price'] if stock_data else 100.0
            hist_data = data_service.generate_mock_data(symbol, current_price, days)
        
        # 转换为JSON格式
        result = []
        for _, row in hist_data.iterrows():
            result.append({
                'date': row['日期'].strftime('%Y-%m-%d'),
                'open': float(row['开盘']),
                'high': float(row['最高']),
                'low': float(row['最低']),
                'close': float(row['收盘']),
                'volume': float(row['成交量'])
            })
        
        return {
            'symbol': symbol,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"History data error for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history data: {str(e)}")


@router.get("/search/{query}")
async def search_stocks(query: str):
    """搜索股票"""
    try:
        # 模拟搜索结果
        mock_results = [
            {'symbol': '000001', 'name': '平安银行', 'market': '深圳'},
            {'symbol': '000002', 'name': '万科A', 'market': '深圳'},
            {'symbol': '600036', 'name': '招商银行', 'market': '上海'},
            {'symbol': '600519', 'name': '贵州茅台', 'market': '上海'},
            {'symbol': '000858', 'name': '五粮液', 'market': '深圳'}
        ]
        
        # 简单的模糊匹配
        results = []
        for stock in mock_results:
            if (query.lower() in stock['symbol'].lower() or 
                query in stock['name'] or 
                query.lower() in stock['name'].lower()):
                results.append(stock)
        
        return {
            'query': query,
            'results': results[:10]  # 限制返回10个结果
        }
        
    except Exception as e:
        logger.error(f"Search error for {query}: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
