"""
自选股和预警相关路由
"""
from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import WatchlistRequest, AlertRequest, WatchlistItem, AlertRule
from services.data_service import StockDataService
from services.database_service import DatabaseService
from datetime import datetime
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

logger = logging.getLogger(__name__)

router = APIRouter()
data_service = StockDataService()
db_service = DatabaseService()

# 简单的内存缓存，缓存股票价格数据
price_cache = {}
CACHE_DURATION = 30  # 缓存30秒

def get_cached_stock_data(symbol: str):
    """获取缓存的股票数据，如果缓存过期则返回None"""
    if symbol in price_cache:
        cached_data, timestamp = price_cache[symbol]
        if time.time() - timestamp < CACHE_DURATION:
            return cached_data
    return None

def set_cached_stock_data(symbol: str, data: dict):
    """设置股票数据缓存"""
    price_cache[symbol] = (data, time.time())

def get_stock_data_with_cache(symbol: str):
    """带缓存的股票数据获取"""
    # 先尝试从缓存获取
    cached_data = get_cached_stock_data(symbol)
    if cached_data:
        return cached_data

    # 缓存未命中，从API获取
    stock_data = data_service.get_stock_info(symbol)
    if stock_data:
        set_cached_stock_data(symbol, stock_data)
    return stock_data

# 现在使用SQLite数据库存储自选股和预警数据


@router.get("/watchlist")
async def get_watchlist():
    """获取自选股列表（优化版：并发请求+缓存）"""
    try:
        start_time = time.time()

        # 从数据库获取自选股列表
        watchlist_items = db_service.get_watchlist()

        if not watchlist_items:
            return {'watchlist': []}

        # 使用线程池并发获取股票数据
        with ThreadPoolExecutor(max_workers=10) as executor:
            # 创建并发任务
            future_to_item = {
                executor.submit(get_stock_data_with_cache, item['symbol']): item
                for item in watchlist_items
            }

            updated_watchlist = []
            for future in future_to_item:
                item = future_to_item[future]
                try:
                    stock_data = future.result(timeout=5)  # 5秒超时
                    if stock_data:
                        updated_item = {
                            'symbol': item['symbol'],
                            'name': stock_data['name'],
                            'price': stock_data['current_price'],
                            'change': stock_data['change_percent'],
                            'added_at': item['added_at']
                        }
                    else:
                        # 如果无法获取实时数据，使用数据库中的名称
                        updated_item = {
                            'symbol': item['symbol'],
                            'name': item['name'],
                            'price': 0.0,
                            'change': 0.0,
                            'added_at': item['added_at']
                        }
                    updated_watchlist.append(updated_item)
                except Exception as e:
                    logger.warning(f"Failed to get data for {item['symbol']}: {e}")
                    # 使用默认数据
                    updated_item = {
                        'symbol': item['symbol'],
                        'name': item['name'],
                        'price': 0.0,
                        'change': 0.0,
                        'added_at': item['added_at']
                    }
                    updated_watchlist.append(updated_item)

        # 按添加时间排序（最新添加的在前）
        updated_watchlist.sort(key=lambda x: x['added_at'], reverse=True)

        end_time = time.time()
        logger.info(f"Watchlist query completed in {end_time - start_time:.2f} seconds")

        return {'watchlist': updated_watchlist}

    except Exception as e:
        logger.error(f"Get watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get watchlist: {str(e)}")


@router.get("/watchlist/fast")
async def get_watchlist_fast():
    """快速获取自选股列表（不包含实时价格，仅基本信息）"""
    try:
        start_time = time.time()

        # 从数据库获取自选股列表
        watchlist_items = db_service.get_watchlist()

        # 直接返回数据库中的信息，不获取实时价格
        fast_watchlist = []
        for item in watchlist_items:
            fast_item = {
                'symbol': item['symbol'],
                'name': item['name'],
                'added_at': item['added_at']
            }
            fast_watchlist.append(fast_item)

        # 按添加时间排序（最新添加的在前）
        fast_watchlist.sort(key=lambda x: x['added_at'], reverse=True)

        end_time = time.time()
        logger.info(f"Fast watchlist query completed in {end_time - start_time:.3f} seconds")

        return {'watchlist': fast_watchlist}

    except Exception as e:
        logger.error(f"Get fast watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get fast watchlist: {str(e)}")


@router.get("/watchlist/prices")
async def get_watchlist_prices():
    """批量获取自选股的实时价格"""
    try:
        start_time = time.time()

        # 从数据库获取自选股列表
        watchlist_items = db_service.get_watchlist()

        if not watchlist_items:
            return {'prices': {}}

        # 使用线程池并发获取价格数据
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_symbol = {
                executor.submit(get_stock_data_with_cache, item['symbol']): item['symbol']
                for item in watchlist_items
            }

            prices = {}
            for future in future_to_symbol:
                symbol = future_to_symbol[future]
                try:
                    stock_data = future.result(timeout=3)  # 3秒超时
                    if stock_data:
                        prices[symbol] = {
                            'price': stock_data['current_price'],
                            'change': stock_data['change_percent'],
                            'name': stock_data['name']
                        }
                    else:
                        prices[symbol] = {
                            'price': 0.0,
                            'change': 0.0,
                            'name': symbol
                        }
                except Exception as e:
                    logger.warning(f"Failed to get price for {symbol}: {e}")
                    prices[symbol] = {
                        'price': 0.0,
                        'change': 0.0,
                        'name': symbol
                    }

        end_time = time.time()
        logger.info(f"Batch price query completed in {end_time - start_time:.2f} seconds")

        return {'prices': prices}

    except Exception as e:
        logger.error(f"Get watchlist prices error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get watchlist prices: {str(e)}")


@router.delete("/watchlist/cache")
async def clear_price_cache():
    """清理价格缓存"""
    try:
        global price_cache
        cache_size = len(price_cache)
        price_cache.clear()
        logger.info(f"Cleared {cache_size} items from price cache")
        return {'message': f'Cleared {cache_size} cached items'}

    except Exception as e:
        logger.error(f"Clear cache error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")


@router.get("/watchlist/cache/stats")
async def get_cache_stats():
    """获取缓存统计信息"""
    try:
        current_time = time.time()
        valid_items = 0
        expired_items = 0

        for symbol, (data, timestamp) in price_cache.items():
            if current_time - timestamp < CACHE_DURATION:
                valid_items += 1
            else:
                expired_items += 1

        return {
            'total_items': len(price_cache),
            'valid_items': valid_items,
            'expired_items': expired_items,
            'cache_duration': CACHE_DURATION
        }

    except Exception as e:
        logger.error(f"Get cache stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")


@router.post("/watchlist")
async def add_to_watchlist(symbol: str, name: str = None):
    """添加股票到自选股"""
    try:
        if name is None:
            name = symbol
        
        if not symbol:
            raise HTTPException(status_code=400, detail="Symbol is required")
        
        # 检查是否已存在
        if db_service.is_in_watchlist(symbol):
            raise HTTPException(status_code=400, detail="Stock already in watchlist")

        # 获取股票信息
        stock_data = data_service.get_stock_info(symbol)
        if stock_data:
            stock_name = stock_data['name']
        else:
            stock_name = name if name else symbol

        # 添加到数据库
        success = db_service.add_to_watchlist(symbol, stock_name)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add stock to watchlist")

        logger.info(f"Added {symbol} ({stock_name}) to watchlist")
        
        return {'message': 'Added to watchlist successfully'}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add to watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add to watchlist: {str(e)}")


@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(symbol: str):
    """从自选股移除股票"""
    try:
        # 从数据库移除
        success = db_service.remove_from_watchlist(symbol)
        if not success:
            raise HTTPException(status_code=404, detail="Stock not found in watchlist")

        logger.info(f"Removed {symbol} from watchlist")
        return {'message': 'Removed from watchlist successfully'}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove from watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to remove from watchlist: {str(e)}")


@router.get("/alerts")
async def get_alerts():
    """获取预警列表"""
    try:
        # 从数据库获取预警列表
        alerts = db_service.get_alerts()

        # 更新预警的当前价格
        updated_alerts = []
        for alert in alerts:
            stock_data = data_service.get_stock_info(alert['symbol'])
            if stock_data:
                alert['current_price'] = stock_data['current_price']
                alert['name'] = stock_data['name']
            else:
                alert['current_price'] = 0.0
            updated_alerts.append(alert)

        return {'alerts': updated_alerts}

    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")


@router.post("/alerts")
async def create_alert(request: AlertRequest):
    """创建价格预警"""
    try:
        # 获取股票信息
        stock_data = data_service.get_stock_info(request.symbol)
        if stock_data:
            stock_name = stock_data['name']
        else:
            stock_name = f"股票-{request.symbol}"

        # 创建预警到数据库
        alert_id = db_service.create_alert(
            symbol=request.symbol,
            name=stock_name,
            condition_type=request.condition,
            target_price=request.value,
            message=request.message or f"{stock_name}价格预警"
        )

        if alert_id is None:
            raise HTTPException(status_code=500, detail="Failed to create alert")

        logger.info(f"Created alert {alert_id} for {request.symbol} at {request.value}")
        return {'message': 'Alert created successfully', 'alert_id': alert_id}
        
    except Exception as e:
        logger.error(f"Create alert error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")


@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    """删除预警"""
    try:
        # 从数据库删除预警
        success = db_service.delete_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")

        logger.info(f"Deleted alert {alert_id}")
        return {'message': 'Alert deleted successfully'}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete alert error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete alert: {str(e)}")


@router.get("/alerts/check")
async def check_alerts():
    """检查预警状态"""
    try:
        triggered_alerts = []

        # 从数据库获取活跃的预警
        alerts = db_service.get_alerts()
        active_alerts = [alert for alert in alerts if alert['status'] == 'active']

        for alert in active_alerts:
            # 获取当前价格
            stock_data = data_service.get_stock_info(alert['symbol'])
            if not stock_data:
                continue

            current_price = stock_data['current_price']

            # 检查预警条件
            triggered = False
            if alert['type'] == 'price_above' and current_price > alert['target_price']:
                triggered = True
            elif alert['type'] == 'price_below' and current_price < alert['target_price']:
                triggered = True

            if triggered:
                # 更新预警状态为已触发
                db_service.update_alert_status(alert['id'], 'triggered')

                triggered_alerts.append({
                    'id': alert['id'],
                    'symbol': alert['symbol'],
                    'name': alert['name'],
                    'message': alert['message'],
                    'target_price': alert['target_price'],
                    'current_price': current_price,
                    'triggered_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })

        return {
            'triggered_count': len(triggered_alerts),
            'triggered_alerts': triggered_alerts
        }
        
    except Exception as e:
        logger.error(f"Check alerts error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to check alerts: {str(e)}")
