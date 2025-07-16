"""
数据库服务类
"""
import sqlite3
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
import sys
import os

# 添加database目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.init_db import get_db_connection

logger = logging.getLogger(__name__)

class DatabaseService:
    """数据库服务类"""
    
    def __init__(self):
        """初始化数据库服务"""
        try:
            # 测试数据库连接
            conn = get_db_connection()
            conn.close()
            logger.info("Database service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database service: {e}")
            raise
    
    # 自选股相关方法
    def get_watchlist(self, user_id: str = 'default') -> List[Dict[str, Any]]:
        """获取用户的自选股列表"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT symbol, name, added_at 
                FROM watchlist 
                WHERE user_id = ? 
                ORDER BY added_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            # 转换为字典列表
            watchlist = []
            for row in rows:
                watchlist.append({
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'added_at': row['added_at']
                })
            
            logger.info(f"Retrieved {len(watchlist)} stocks from watchlist for user {user_id}")
            return watchlist
            
        except Exception as e:
            logger.error(f"Failed to get watchlist: {e}")
            return []
    
    def add_to_watchlist(self, symbol: str, name: str, user_id: str = 'default') -> bool:
        """添加股票到自选股"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR IGNORE INTO watchlist (symbol, name, user_id) 
                VALUES (?, ?, ?)
            ''', (symbol, name, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                logger.info(f"Added {symbol} ({name}) to watchlist for user {user_id}")
            else:
                logger.warning(f"Stock {symbol} already exists in watchlist for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to add to watchlist: {e}")
            return False
    
    def remove_from_watchlist(self, symbol: str, user_id: str = 'default') -> bool:
        """从自选股移除股票"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                DELETE FROM watchlist 
                WHERE symbol = ? AND user_id = ?
            ''', (symbol, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                logger.info(f"Removed {symbol} from watchlist for user {user_id}")
            else:
                logger.warning(f"Stock {symbol} not found in watchlist for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to remove from watchlist: {e}")
            return False
    
    def is_in_watchlist(self, symbol: str, user_id: str = 'default') -> bool:
        """检查股票是否在自选股中"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM watchlist 
                WHERE symbol = ? AND user_id = ?
            ''', (symbol, user_id))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count > 0
            
        except Exception as e:
            logger.error(f"Failed to check watchlist: {e}")
            return False
    
    # 预警相关方法
    def get_alerts(self, user_id: str = 'default') -> List[Dict[str, Any]]:
        """获取用户的预警列表"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, symbol, name, condition_type, target_price, 
                       message, status, created_at, triggered_at
                FROM alerts 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            # 转换为字典列表
            alerts = []
            for row in rows:
                alerts.append({
                    'id': row['id'],
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'type': row['condition_type'],
                    'target_price': row['target_price'],
                    'message': row['message'],
                    'status': row['status'],
                    'created_at': row['created_at'],
                    'triggered_at': row['triggered_at']
                })
            
            logger.info(f"Retrieved {len(alerts)} alerts for user {user_id}")
            return alerts
            
        except Exception as e:
            logger.error(f"Failed to get alerts: {e}")
            return []
    
    def create_alert(self, symbol: str, name: str, condition_type: str, 
                    target_price: float, message: str = "", user_id: str = 'default') -> Optional[int]:
        """创建预警"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO alerts (symbol, name, condition_type, target_price, message, user_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (symbol, name, condition_type, target_price, message, user_id))
            
            alert_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            logger.info(f"Created alert {alert_id} for {symbol} at {target_price}")
            return alert_id
            
        except Exception as e:
            logger.error(f"Failed to create alert: {e}")
            return None
    
    def delete_alert(self, alert_id: int, user_id: str = 'default') -> bool:
        """删除预警"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                DELETE FROM alerts 
                WHERE id = ? AND user_id = ?
            ''', (alert_id, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                logger.info(f"Deleted alert {alert_id} for user {user_id}")
            else:
                logger.warning(f"Alert {alert_id} not found for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete alert: {e}")
            return False
    
    def update_alert_status(self, alert_id: int, status: str, user_id: str = 'default') -> bool:
        """更新预警状态"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            triggered_at = datetime.now().isoformat() if status == 'triggered' else None
            
            cursor.execute('''
                UPDATE alerts 
                SET status = ?, triggered_at = ?
                WHERE id = ? AND user_id = ?
            ''', (status, triggered_at, alert_id, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                logger.info(f"Updated alert {alert_id} status to {status}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to update alert status: {e}")
            return False
