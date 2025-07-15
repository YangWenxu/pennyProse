"""
自选股和预警相关路由
"""
from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.stock_models import WatchlistRequest, AlertRequest, WatchlistItem, AlertRule
from services.data_service import StockDataService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
data_service = StockDataService()

# 全局变量存储自选股和预警数据（实际应用中应使用数据库）
watchlist_data = [
    {'symbol': '000001', 'name': '平安银行', 'price': 12.73, 'change': -1.93},
    {'symbol': '000002', 'name': '万科A', 'price': 8.45, 'change': 0.24},
    {'symbol': '000858', 'name': '五粮液', 'price': 128.5, 'change': 2.15}
]

alert_rules = [
    {
        'id': 1,
        'symbol': '000001',
        'name': '平安银行',
        'type': 'price_above',
        'target_price': 13.0,
        'current_price': 12.73,
        'status': 'active',
        'message': '平安银行突破13元',
        'created_at': '2025-07-15 19:30:00'
    }
]

next_alert_id = 2


@router.get("/watchlist")
async def get_watchlist():
    """获取自选股列表"""
    try:
        # 更新自选股的实时价格
        updated_watchlist = []
        for item in watchlist_data:
            stock_data = data_service.get_stock_info(item['symbol'])
            if stock_data:
                updated_item = {
                    'symbol': item['symbol'],
                    'name': stock_data['name'],
                    'price': stock_data['current_price'],
                    'change': stock_data['change_percent']
                }
            else:
                updated_item = item
            updated_watchlist.append(updated_item)
        
        return {'watchlist': updated_watchlist}
        
    except Exception as e:
        logger.error(f"Get watchlist error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get watchlist: {str(e)}")


@router.post("/watchlist")
async def add_to_watchlist(symbol: str, name: str = None):
    """添加股票到自选股"""
    try:
        if name is None:
            name = symbol
        
        if not symbol:
            raise HTTPException(status_code=400, detail="Symbol is required")
        
        # 检查是否已存在
        for item in watchlist_data:
            if item['symbol'] == symbol:
                raise HTTPException(status_code=400, detail="Stock already in watchlist")
        
        # 获取股票信息
        stock_data = data_service.get_stock_info(symbol)
        if stock_data:
            new_item = {
                'symbol': symbol,
                'name': stock_data['name'],
                'price': stock_data['current_price'],
                'change': stock_data['change_percent']
            }
        else:
            # 使用默认值
            new_item = {
                'symbol': symbol,
                'name': name,
                'price': 100.0,
                'change': 0.0
            }
        
        watchlist_data.append(new_item)
        logger.info(f"Added {symbol} to watchlist")
        
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
        global watchlist_data
        original_length = len(watchlist_data)
        watchlist_data = [item for item in watchlist_data if item['symbol'] != symbol]
        
        if len(watchlist_data) == original_length:
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
        # 更新预警的当前价格
        updated_alerts = []
        for alert in alert_rules:
            stock_data = data_service.get_stock_info(alert['symbol'])
            if stock_data:
                alert['current_price'] = stock_data['current_price']
                alert['name'] = stock_data['name']
            updated_alerts.append(alert)
        
        return {'alerts': updated_alerts}
        
    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")


@router.post("/alerts")
async def create_alert(request: AlertRequest):
    """创建价格预警"""
    try:
        global next_alert_id
        
        # 获取股票信息
        stock_data = data_service.get_stock_info(request.symbol)
        if stock_data:
            stock_name = stock_data['name']
            current_price = stock_data['current_price']
        else:
            stock_name = f"股票-{request.symbol}"
            current_price = 100.0
        
        # 创建预警规则
        new_alert = {
            'id': next_alert_id,
            'symbol': request.symbol,
            'name': stock_name,
            'type': request.condition,
            'target_price': request.value,
            'current_price': current_price,
            'status': 'active',
            'message': request.message or f"{stock_name}价格预警",
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        alert_rules.append(new_alert)
        next_alert_id += 1
        
        logger.info(f"Created alert for {request.symbol}")
        
        return {
            'message': 'Alert created successfully',
            'alert': new_alert
        }
        
    except Exception as e:
        logger.error(f"Create alert error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create alert: {str(e)}")


@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    """删除预警"""
    try:
        global alert_rules
        original_length = len(alert_rules)
        alert_rules = [alert for alert in alert_rules if alert['id'] != alert_id]
        
        if len(alert_rules) == original_length:
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
        
        for alert in alert_rules:
            if alert['status'] != 'active':
                continue
                
            # 获取当前价格
            stock_data = data_service.get_stock_info(alert['symbol'])
            if not stock_data:
                continue
                
            current_price = stock_data['current_price']
            alert['current_price'] = current_price
            
            # 检查预警条件
            triggered = False
            if alert['type'] == 'price_above' and current_price > alert['target_price']:
                triggered = True
            elif alert['type'] == 'price_below' and current_price < alert['target_price']:
                triggered = True
            
            if triggered:
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
