# PennyProse - 创作与分析的完美融合

一个集博客创作与股票分析于一体的现代化平台，采用前后端分离架构，基于 React + Vite 前端、Node.js + Koa 博客后端和 Python + FastAPI 股票分析服务构建。

## 项目架构

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   博客后端       │    │  股票分析服务    │
│  React + Vite   │◄──►│ Node.js + Koa   │    │ Python + FastAPI│
│   Port: 5174    │    │   Port: 3001    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户界面       │    │   SQLite 数据库  │    │   实时股票数据   │
│  博客 + 股票     │    │   博客内容存储   │    │  腾讯财经 API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 目录结构

```
pennyprose/
├── frontend/              # React + Vite 前端应用
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── blog/         # 博客相关页面
│   │   │   └── stocks/       # 股票分析页面
│   │   ├── hooks/            # 自定义 hooks
│   │   ├── utils/            # 工具函数
│   │   ├── styles/           # 样式文件
│   │   └── api/              # API 调用
│   ├── public/
│   └── package.json
├── backend/               # Node.js + Koa 博客后端服务
│   ├── src/
│   │   ├── main.js           # 应用入口文件
│   │   ├── routes/           # 路由定义
│   │   │   ├── posts.js      # 文章路由
│   │   │   ├── categories.js # 分类路由
│   │   │   ├── tags.js       # 标签路由
│   │   │   ├── comments.js   # 评论路由
│   │   │   └── admin.js      # 管理员路由
│   │   ├── services/         # 业务逻辑层
│   │   │   ├── posts.js      # 文章服务
│   │   │   ├── categories.js # 分类服务
│   │   │   ├── tags.js       # 标签服务
│   │   │   ├── comments.js   # 评论服务
│   │   │   ├── admin.js      # 管理员服务
│   │   │   └── database.js   # 数据库服务
│   │   └── middleware/       # 中间件
│   │       ├── auth.js       # 认证中间件
│   │       └── validation.js # 数据验证中间件
│   ├── prisma/               # Prisma 数据库配置
│   │   ├── schema.prisma     # 数据库模式
│   │   └── dev.db           # SQLite 数据库文件
│   ├── package.json
│   └── pnpm-lock.yaml
├── stock-analysis/        # Python + FastAPI 股票分析服务
│   ├── .gitignore            # Git忽略文件配置
│   ├── main.py               # FastAPI 应用入口
│   ├── requirements.txt      # Python 依赖
│   ├── start.sh              # 启动脚本
│   ├── models/               # 数据模型
│   │   └── stock_models.py   # Pydantic数据模型定义
│   ├── services/             # 业务逻辑层
│   │   ├── data_service.py   # 数据获取服务
│   │   ├── analysis_service.py # 股票分析服务
│   │   └── backtest_service.py # 回测服务
│   ├── routers/              # 路由层
│   │   ├── stock_router.py   # 股票分析路由
│   │   ├── watchlist_router.py # 自选股和预警路由
│   │   └── backtest_router.py # 回测路由
│   └── utils/                # 工具函数
│       └── technical_analysis.py # 技术分析工具
├── shared/                # 共享类型定义和工具
└── docs/                  # 项目文档
```

## 技术栈

### 前端技术
- **React 18** - 用户界面库，提供现代化的组件化开发
- **Vite** - 快速构建工具，支持热更新和模块化
- **React Router** - 单页应用路由管理
- **Tailwind CSS** - 原子化CSS框架，快速样式开发
- **Lucide React** - 现代化图标库
- **React Hook Form** - 高性能表单处理
- **React Markdown** - Markdown 内容渲染

### 博客后端服务 (Node.js)
- **Node.js** - JavaScript 运行时环境
- **Koa.js** - 轻量级、现代化的 Web 框架
- **Koa Router** - 路由中间件
- **Koa Bodyparser** - 请求体解析中间件
- **Koa CORS** - 跨域资源共享中间件
- **Koa Static** - 静态文件服务中间件
- **Prisma** - 现代化 ORM 和数据库工具
- **SQLite** - 轻量级关系型数据库
- **JWT** - JSON Web Token 身份验证
- **Bcrypt** - 密码加密和验证
- **Joi** - 数据验证和模式定义
- **Gray Matter** - Markdown 文件解析

### 股票分析服务 (Python)
- **Python 3.8+** - 高性能数据分析语言
- **FastAPI** - 现代化、高性能的 Web 框架
- **Uvicorn** - ASGI 服务器，支持异步处理
- **Pandas** - 数据分析和处理库
- **NumPy** - 数值计算库
- **TA-Lib** - 技术分析指标库
- **EFinance** - 东方财富数据接口
- **Requests** - HTTP 请求库
- **Pydantic** - 数据验证和序列化

### 股票分析服务架构
- **模块化设计** - 分层架构，职责清晰分离
- **数据模型层** - Pydantic模型定义和数据验证
- **服务层** - 业务逻辑封装和数据处理
- **路由层** - API端点定义和请求处理
- **工具层** - 技术分析算法和工具函数
- **多数据源** - 容错机制和备用数据源
- **类型安全** - 完整的类型注解和验证

### 数据源和API
- **腾讯财经API** - 实时股票数据获取
- **新浪财经API** - 备用股票数据源
- **东方财富API** - 历史数据和股票信息

## 功能特性

### 博客创作功能
- 📝 文章列表和详情展示
- 🏷️ 分类和标签筛选
- 📅 按时间归档
- 🔍 文章搜索
- 💬 评论系统
- ✍️ 文章编写和编辑（Markdown 支持）
- 📂 分类和标签管理
- 📱 响应式设计

### 股票分析功能
- 📈 **8大技术指标分析**
  - MACD (指数平滑移动平均线)
  - KDJ (随机指标)
  - RSI (相对强弱指标)
  - 布林带 (Bollinger Bands)
  - 威廉指标 (Williams %R)
  - 江恩线 (Gann Lines)
  - 移动平均线 (MA5, MA10, MA20, MA60)
  - 量能分析 (Volume Analysis)
- ⭐ **自选股管理** - 添加、删除、实时监控
- 🔔 **智能预警系统** - 价格突破、技术指标预警
- 🎯 **策略回测功能** - 均线交叉策略历史回测
- 📊 **实时数据获取** - 多数据源保障数据可靠性
- � **股票搜索** - 快速查找A股股票
- � **响应式图表** - 移动端友好的数据可视化
- 🏗️ **模块化架构** - 清晰的分层设计，易于维护和扩展
- 🛡️ **容错机制** - 多数据源备份，服务稳定可靠
- 🔧 **类型安全** - 完整的数据验证和类型检查

### 管理后台
- 👥 用户管理
- 📊 数据统计
- ⚙️ 系统设置

## 开发计划

1. ✅ 项目架构设计和初始化
2. 🔄 前端基础设置
3. ⏳ 后端API服务搭建
4. ⏳ 数据库设计和模型
5. ⏳ 博客首页界面开发
6. ⏳ 文章详情页面开发
7. ⏳ 后台管理系统开发
8. ⏳ 用户认证和权限系统
9. ⏳ API接口开发
10. ⏳ 前后端集成和测试

## 快速开始

### 环境要求
- **Node.js** >= 16 (博客后端和前端)
- **Python** >= 3.8 (股票分析服务)
- **npm** 或 **yarn** (包管理器)

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd pennyprose
```

2. **安装依赖**
```bash
# 安装前端依赖
cd frontend
npm install

# 安装博客后端依赖
cd ../backend
npm install

# 安装股票分析服务依赖
cd ../stock-analysis
pip install -r requirements.txt
```

3. **启动开发服务器**

需要同时启动三个服务：

```bash
# 终端1: 启动博客后端服务 (端口 3001)
cd backend
npm run dev

# 终端2: 启动股票分析服务 (端口 8001)
cd stock-analysis
python main.py

# 终端3: 启动前端服务 (端口 5174)
cd frontend
npm run dev
```

4. **访问应用**
- 前端应用: http://localhost:5174
- 博客后端API: http://localhost:3001
- 股票分析API: http://localhost:8001

## 核心技术特性

### 微服务架构
- **服务分离**: 博客服务和股票分析服务独立部署
- **技术栈优化**: 不同服务使用最适合的技术栈
  - 博客服务：Koa.js (轻量级、高性能、中间件生态)
  - 股票分析：Python (数据分析、机器学习生态)
- **可扩展性**: 各服务可独立扩展和维护

### 股票分析算法
- **多数据源容错**: 主数据源失败时自动切换备用源
- **实时数据处理**: 支持实时股价和技术指标计算
- **专业技术分析**: 基于TA-Lib库的专业金融指标
- **智能预警**: 基于技术指标的智能预警系统

### 前端架构
- **组件化设计**: 高度可复用的React组件
- **状态管理**: 使用React Hooks进行状态管理
- **响应式布局**: 支持桌面端和移动端
- **模块化路由**: 清晰的页面路由结构

### 后端架构 (Koa.js)
- **轻量级框架**: 基于async/await的现代化Web框架
- **洋葱模型**: Koa独特的中间件执行模型，更好的控制流
- **分层架构**: 路由层、服务层、数据层清晰分离
- **模块化设计**: 按功能模块组织代码，便于维护和扩展
- **中间件生态**: 丰富的Koa中间件生态系统
- **数据验证**: 使用Joi进行请求数据验证
- **身份认证**: JWT token认证机制
- **数据库集成**: Prisma ORM提供类型安全的数据库操作
- **错误处理**: 统一的错误处理和响应格式
- **静态文件**: Koa Static中间件处理静态资源

### 数据安全
- **CORS配置**: 跨域资源共享安全配置
- **数据验证**: 前后端双重数据验证
- **错误处理**: 完善的错误处理和日志记录

## API文档

### 博客API (Koa.js)
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/categories` - 获取分类列表
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 创建评论

### 股票分析API (Python)
- `POST /analyze` - 股票技术分析
- `GET /history/{symbol}` - 获取历史数据
- `GET /search/{query}` - 股票搜索
- `GET /watchlist` - 获取自选股列表
- `POST /watchlist` - 添加自选股
- `DELETE /watchlist/{symbol}` - 删除自选股
- `GET /alerts` - 获取预警列表
- `POST /alerts` - 创建预警
- `DELETE /alerts/{id}` - 删除预警
- `GET /alerts/check` - 检查预警状态
- `POST /backtest` - 策略回测

### 股票分析服务模块化架构

#### 📁 目录结构
```
stock-analysis/
├── main.py                    # 应用入口和路由注册
├── models/                    # 数据模型层
│   └── stock_models.py        # Pydantic数据模型
├── services/                  # 业务逻辑层
│   ├── data_service.py        # 数据获取服务
│   ├── analysis_service.py    # 股票分析服务
│   └── backtest_service.py    # 回测服务
├── routers/                   # 路由层
│   ├── stock_router.py        # 股票分析路由
│   ├── watchlist_router.py    # 自选股和预警路由
│   └── backtest_router.py     # 回测路由
└── utils/                     # 工具层
    └── technical_analysis.py  # 技术分析工具
```

#### 🏗️ 架构设计原则
- **分层架构** - 数据模型、业务逻辑、路由处理分离
- **单一职责** - 每个模块专注特定功能
- **依赖注入** - 服务间松耦合设计
- **类型安全** - 完整的类型注解和验证
- **错误处理** - 统一的异常处理机制
- **容错设计** - 多数据源备份和降级策略

#### 🔧 核心模块说明
- **DataService** - 多数据源股票数据获取
- **AnalysisService** - 8大技术指标计算和分析
- **BacktestService** - 策略回测和性能评估
- **TechnicalAnalysis** - TA-Lib技术分析工具封装

## 开发指南

### 添加新的技术指标
1. 在 `stock-analysis/utils/` 中添加指标计算函数
2. 在 `main.py` 的分析函数中集成新指标
3. 在前端添加对应的显示组件

### 扩展预警功能
1. 在后端 `alert_rules` 中定义新的预警类型
2. 实现预警检查逻辑
3. 在前端添加预警配置界面

## 部署说明

### Docker部署 (推荐)
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 传统部署
1. 配置生产环境变量
2. 构建前端静态文件
3. 部署到服务器
4. 配置反向代理

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
