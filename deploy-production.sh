#!/bin/bash

# PennyProse 生产环境部署脚本
# 用于在服务器上拉取最新的Docker镜像并部署

set -e

echo "🚀 开始部署 PennyProse 到生产环境..."

# 检查必需的环境变量
if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ 请设置 DOCKER_USERNAME 环境变量"
    exit 1
fi

# 设置镜像名称
FRONTEND_IMAGE="${DOCKER_USERNAME}/pennyprose-frontend:latest"
BACKEND_IMAGE="${DOCKER_USERNAME}/pennyprose-backend:latest"
STOCK_API_IMAGE="${DOCKER_USERNAME}/pennyprose-stock-api:latest"

echo "📦 拉取最新的Docker镜像..."

# 拉取最新镜像
docker pull $FRONTEND_IMAGE
docker pull $BACKEND_IMAGE
docker pull $STOCK_API_IMAGE

echo "🔄 停止现有服务..."

# 停止现有容器
docker-compose -f docker-compose.prod.yml down

echo "🚀 启动新服务..."

# 启动新服务
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ 等待服务启动..."
sleep 30

echo "🔍 检查服务状态..."

# 检查服务健康状态
services=("frontend:80" "backend:3001" "stock-analysis:8001")
all_healthy=true

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $service_name 服务运行正常"
    else
        echo "❌ $service_name 服务启动失败"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "🎉 部署成功完成！"
    echo ""
    echo "📱 访问地址："
    echo "  前端应用: http://localhost"
    echo "  Node.js API: http://localhost:3001"
    echo "  Python API: http://localhost:8001"
    echo "  API文档: http://localhost:8001/docs"
    echo ""
    echo "🔧 管理命令："
    echo "  查看日志: docker-compose -f docker-compose.prod.yml logs -f [service_name]"
    echo "  停止服务: docker-compose -f docker-compose.prod.yml down"
    echo "  重启服务: docker-compose -f docker-compose.prod.yml restart [service_name]"
else
    echo ""
    echo "❌ 部署过程中出现问题，请检查日志："
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
