"""
股票分析API服务
基于FastAPI构建的股票技术分析服务 - 模块化版本
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.stock_router import router as stock_router
from routers.watchlist_router import router as watchlist_router
from routers.backtest_router import router as backtest_router
import logging
import uvicorn

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="股票分析API",
    description="提供股票技术分析、自选股管理、预警系统等功能",
    version="2.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "stock-analysis-api"}

# 注册路由
app.include_router(stock_router, tags=["股票分析"])
app.include_router(watchlist_router, tags=["自选股和预警"])
app.include_router(backtest_router, tags=["策略回测"])


@app.get("/")
async def root():
    """健康检查"""
    return {
        "message": "股票分析API服务运行正常",
        "version": "2.0.0",
        "status": "healthy",
        "features": [
            "股票技术分析",
            "自选股管理", 
            "价格预警",
            "策略回测",
            "历史数据查询",
            "股票搜索"
        ]
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "timestamp": "2025-07-15"}


if __name__ == "__main__":
    logger.info("Starting Stock Analysis API Server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
