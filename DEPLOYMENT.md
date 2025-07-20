# 🚀 GitHub Actions 自动部署指南

## 快速开始

### 1. 准备工作

#### 1.1 创建GitHub仓库
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit: PennyProse full-stack application"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/YOUR_USERNAME/PennyProse.git
git push -u origin main
```

#### 1.2 创建Docker Hub账户
1. 访问 [Docker Hub](https://hub.docker.com/) 注册账户
2. 创建三个公开仓库：
   - `your-username/pennyprose-frontend`
   - `your-username/pennyprose-backend`
   - `your-username/pennyprose-stock-api`

### 2. 配置GitHub Secrets

在GitHub仓库中设置以下Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret" 添加：

```bash
# 必需的Secrets
DOCKER_USERNAME=你的DockerHub用户名
DOCKER_PASSWORD=你的DockerHub密码或访问令牌

# 安全配置
JWT_SECRET=你的JWT密钥（使用: openssl rand -base64 32）
POSTGRES_PASSWORD=你的数据库密码

# 可选：云平台部署
RAILWAY_TOKEN=你的Railway令牌
HEROKU_API_KEY=你的Heroku API密钥
HEROKU_EMAIL=你的Heroku邮箱
VERCEL_TOKEN=你的Vercel令牌
```

### 3. 触发自动部署

#### 3.1 推送代码触发
```bash
# 任何推送到main分支都会触发部署
git push origin main
```

#### 3.2 手动触发
1. 进入GitHub仓库
2. 点击 Actions 标签
3. 选择 "Deploy PennyProse Full Stack Application"
4. 点击 "Run workflow"

### 4. 监控部署状态

#### 4.1 查看部署进度
- 访问 `https://github.com/YOUR_USERNAME/PennyProse/actions`
- 点击最新的工作流运行查看详细日志

#### 4.2 部署状态徽章
在README中显示部署状态：
```markdown
[![Deploy Status](https://github.com/YOUR_USERNAME/PennyProse/workflows/Deploy%20PennyProse%20Full%20Stack%20Application/badge.svg)](https://github.com/YOUR_USERNAME/PennyProse/actions)
```

### 5. 部署到服务器

#### 5.1 使用生产部署脚本
```bash
# 在服务器上运行
export DOCKER_USERNAME=your-docker-username
chmod +x deploy-production.sh
./deploy-production.sh
```

#### 5.2 手动部署
```bash
# 拉取最新镜像
docker pull your-username/pennyprose-frontend:latest
docker pull your-username/pennyprose-backend:latest
docker pull your-username/pennyprose-stock-api:latest

# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d
```

## 部署流程说明

### 自动化流程
1. **代码推送** → GitHub检测到变更
2. **并行构建** → 同时构建前端、Node.js后端、Python后端
3. **运行测试** → 自动执行单元测试
4. **构建镜像** → 创建Docker镜像
5. **推送镜像** → 上传到Docker Hub
6. **部署通知** → 生成部署报告

### 服务架构
```
GitHub Actions
    ├── Frontend (React + Nginx)
    ├── Backend (Node.js + Express)
    └── Stock API (Python + FastAPI)
         ↓
Docker Hub Registry
         ↓
Production Server
    ├── Frontend:80
    ├── Backend:3001
    ├── Stock API:8001
    ├── PostgreSQL:5432
    └── Redis:6379
```

## 故障排除

### 常见问题

#### 1. Docker登录失败
```bash
# 检查Docker Hub凭据
echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
```

#### 2. 测试失败
```bash
# 本地运行测试
cd backend && npm test
cd stock-analysis && python -m pytest tests/ -v
```

#### 3. 镜像构建失败
```bash
# 本地测试Docker构建
docker build -t test-frontend ./frontend
docker build -t test-backend ./backend
docker build -t test-stock-api ./stock-analysis
```

#### 4. 服务启动失败
```bash
# 检查服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs stock-analysis
```

### 调试技巧

1. **查看GitHub Actions日志**
   - 点击失败的工作流查看详细错误信息

2. **本地复现问题**
   - 使用相同的Docker命令在本地测试

3. **检查环境变量**
   - 确保所有必需的Secrets都已正确设置

4. **验证镜像**
   - 在Docker Hub中确认镜像已成功推送

## 高级配置

### 多环境部署
```yaml
# 在GitHub Actions中配置不同环境
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
```

### 自定义域名
```yaml
# 在docker-compose.prod.yml中配置
labels:
  - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
```

### 监控和告警
```yaml
# 添加Slack通知
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```
