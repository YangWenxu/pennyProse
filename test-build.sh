#!/bin/bash

# 测试构建脚本 - 验证所有组件是否能正常构建

set -e  # 遇到错误时退出

echo "🧪 Testing PennyProse Build Process"
echo "=================================="

# 测试前端构建
echo ""
echo "📦 Testing Frontend Build..."
cd frontend
echo "Installing frontend dependencies..."
pnpm install --no-frozen-lockfile
echo "Building frontend..."
pnpm run build
echo "✅ Frontend build successful!"
cd ..

# 测试后端构建
echo ""
echo "🔧 Testing Backend Build..."
cd backend
echo "Installing backend dependencies..."
pnpm install --no-frozen-lockfile --prod
echo "Generating Prisma client..."
pnpm db:generate
echo "✅ Backend build successful!"
cd ..

# 测试Python后端
echo ""
echo "🐍 Testing Python Backend..."
cd stock-analysis
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt
echo "Initializing database..."
python database/init_db.py
echo "✅ Python backend setup successful!"
cd ..

echo ""
echo "🎉 All builds completed successfully!"
echo "Ready for Docker containerization."
