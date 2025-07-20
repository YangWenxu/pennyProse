#!/bin/bash

# PennyProse 全栈应用部署脚本
set -e

echo "🚀 开始部署 PennyProse 全栈应用..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 设置环境变量
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
export POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 16)}

echo "📦 构建Docker镜像..."

# 停止现有容器
docker-compose down

# 构建并启动所有服务
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 30

# 检查服务健康状态
echo "🔍 检查服务状态..."

# 检查前端
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "❌ 前端服务启动失败"
fi

# 检查Node.js后端
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Node.js后端服务运行正常"
else
    echo "❌ Node.js后端服务启动失败"
fi

# 检查Python后端
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ Python后端服务运行正常"
else
    echo "❌ Python后端服务启动失败"
fi

# 检查数据库
if docker-compose exec -T postgres pg_isready > /dev/null 2>&1; then
    echo "✅ PostgreSQL数据库运行正常"
else
    echo "❌ PostgreSQL数据库启动失败"
fi

echo "📊 显示运行状态..."
docker-compose ps

echo "🎉 部署完成！"
echo ""
echo "📱 访问地址："
echo "  前端应用: http://localhost"
echo "  Node.js API: http://localhost:3001"
echo "  Python API: http://localhost:8001"
echo "  API文档: http://localhost:8001/docs"
echo ""
echo "🔧 管理命令："
echo "  查看日志: docker-compose logs -f [service_name]"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart [service_name]"
echo ""
echo "💾 数据持久化："
echo "  数据库数据: postgres-data volume"
echo "  Redis数据: redis-data volume"
echo "  上传文件: backend-uploads volume"
echo "  股票数据: stock-db volume"
