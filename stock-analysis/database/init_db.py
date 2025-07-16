"""
数据库初始化脚本
"""
import sqlite3
import os
from datetime import datetime

def init_database():
    """初始化SQLite数据库"""
    # 确保database目录存在
    db_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    db_path = os.path.join(db_dir, 'stock_analysis.db')
    
    # 连接数据库（如果不存在会自动创建）
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建自选股表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id TEXT DEFAULT 'default',
            UNIQUE(symbol, user_id)
        )
    ''')
    
    # 创建预警表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            name TEXT NOT NULL,
            condition_type TEXT NOT NULL,
            target_price REAL NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            triggered_at TIMESTAMP NULL,
            user_id TEXT DEFAULT 'default'
        )
    ''')
    
    # 创建用户表（为将来扩展准备）
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # 插入默认自选股数据（如果表为空）
    cursor.execute('SELECT COUNT(*) FROM watchlist')
    if cursor.fetchone()[0] == 0:
        default_stocks = [
            ('000001', '平安银行'),
            ('000002', '万科A'),
            ('000858', '五粮液'),
            ('600519', '贵州茅台'),
            ('000001', '平安银行')
        ]
        
        for symbol, name in default_stocks:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO watchlist (symbol, name, user_id) 
                    VALUES (?, ?, 'default')
                ''', (symbol, name))
            except sqlite3.IntegrityError:
                pass  # 忽略重复插入
    
    # 提交更改并关闭连接
    conn.commit()
    conn.close()
    
    print(f"Database initialized at: {db_path}")
    return db_path

def get_db_connection():
    """获取数据库连接"""
    db_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(db_dir, 'stock_analysis.db')
    
    # 如果数据库不存在，先初始化
    if not os.path.exists(db_path):
        init_database()
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # 使查询结果可以像字典一样访问
    return conn

if __name__ == "__main__":
    init_database()
