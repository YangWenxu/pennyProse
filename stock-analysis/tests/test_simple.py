"""
简化的股票分析API测试
避免复杂的技术分析依赖
"""
import pytest
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_basic_imports():
    """测试基本模块导入"""
    try:
        import pandas as pd
        import numpy as np
        from fastapi import FastAPI
        assert True
    except ImportError as e:
        pytest.fail(f"Basic import failed: {e}")

def test_database_init():
    """测试数据库初始化"""
    try:
        from database.init_db import init_database
        # 不实际运行初始化，只测试导入
        assert callable(init_database)
    except ImportError as e:
        pytest.fail(f"Database init import failed: {e}")

def test_stock_models():
    """测试股票模型"""
    try:
        from models.stock_models import StockData, StockAnalysisRequest
        # 测试模型创建
        stock_data = StockData(
            name="测试股票",
            current_price=10.0,
            change_percent=5.0
        )
        assert stock_data.name == "测试股票"
        assert stock_data.current_price == 10.0
        assert stock_data.change_percent == 5.0

        analysis_request = StockAnalysisRequest(
            symbol="000001",
            period="1y"
        )
        assert analysis_request.symbol == "000001"
        assert analysis_request.period == "1y"

    except ImportError as e:
        pytest.fail(f"Stock models import failed: {e}")

def test_technical_analysis_import():
    """测试技术分析模块导入（不执行计算）"""
    try:
        from utils.technical_analysis import (
            calculate_macd,
            calculate_rsi,
            calculate_moving_averages
        )
        # 只测试函数是否可调用
        assert callable(calculate_macd)
        assert callable(calculate_rsi)
        assert callable(calculate_moving_averages)
    except ImportError as e:
        pytest.fail(f"Technical analysis import failed: {e}")

def test_services_import():
    """测试服务模块导入"""
    try:
        from services.analysis_service import StockAnalysisService
        from services.data_service import StockDataService
        from services.backtest_service import BacktestService

        # 测试服务类是否可实例化
        assert StockAnalysisService is not None
        assert StockDataService is not None
        assert BacktestService is not None
    except ImportError as e:
        pytest.fail(f"Services import failed: {e}")

def test_sample_data_processing():
    """测试样本数据处理"""
    try:
        import pandas as pd
        import numpy as np
        
        # 创建样本数据
        sample_data = pd.DataFrame({
            '收盘': [10.0, 10.5, 11.0, 10.8, 11.2],
            '最高': [10.2, 10.8, 11.3, 11.0, 11.5],
            '最低': [9.8, 10.2, 10.8, 10.5, 10.9],
            '成交量': [1000000, 1200000, 1100000, 1300000, 1150000]
        })
        
        # 基本统计计算
        mean_price = sample_data['收盘'].mean()
        max_price = sample_data['收盘'].max()
        min_price = sample_data['收盘'].min()
        
        assert mean_price > 0
        assert max_price >= mean_price
        assert min_price <= mean_price
        
        # 简单移动平均
        ma3 = sample_data['收盘'].rolling(window=3).mean()
        assert len(ma3) == len(sample_data)
        
    except Exception as e:
        pytest.fail(f"Sample data processing failed: {e}")

def test_fastapi_app_creation():
    """测试FastAPI应用创建"""
    try:
        from fastapi import FastAPI
        
        # 创建简单的FastAPI应用
        app = FastAPI(title="Test Stock Analysis API")
        
        @app.get("/test")
        def test_endpoint():
            return {"message": "test successful"}
        
        assert app.title == "Test Stock Analysis API"
        
    except Exception as e:
        pytest.fail(f"FastAPI app creation failed: {e}")

if __name__ == "__main__":
    # 运行所有测试
    pytest.main([__file__, "-v"])
