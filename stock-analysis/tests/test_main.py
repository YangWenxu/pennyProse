"""
股票分析API测试
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    """测试健康检查端点"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "stock-analysis-api"

def test_analyze_stock():
    """测试股票分析端点"""
    response = client.post("/analyze", json={
        "symbol": "000001",
        "period": "1y"
    })
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "symbol" in data
    assert data["symbol"] == "000001"

def test_get_watchlist():
    """测试获取自选股列表"""
    response = client.get("/watchlist")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert isinstance(data["watchlist"], list)

def test_get_watchlist_fast():
    """测试快速获取自选股列表"""
    response = client.get("/watchlist/fast")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert isinstance(data["watchlist"], list)

def test_add_to_watchlist():
    """测试添加股票到自选股"""
    response = client.post("/watchlist?symbol=002832&name=比音勒芬")
    # 可能返回200（成功添加）或400（已存在）
    assert response.status_code in [200, 400]

def test_get_alerts():
    """测试获取预警列表"""
    response = client.get("/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert isinstance(data["alerts"], list)

def test_invalid_stock_symbol():
    """测试无效股票代码"""
    response = client.post("/analyze", json={
        "symbol": "INVALID",
        "period": "1y"
    })
    # 应该返回错误或空结果，但不应该崩溃
    assert response.status_code in [200, 400, 422]
