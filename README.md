# PennyProse - 创作与分析的完美融合

[![Deploy Status](https://github.com/YOUR_USERNAME/PennyProse/workflows/Deploy%20PennyProse%20Full%20Stack%20Application/badge.svg)](https://github.com/YOUR_USERNAME/PennyProse/actions)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2018-green)](https://nodejs.org/)
[![Stock API](https://img.shields.io/badge/Stock%20API-Python%203.11-yellow)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com/)

一个集博客创作与专业股票分析于一体的现代化平台，采用前后端分离架构，基于 React + Vite 前端、Node.js + Koa 博客后端和 Python + FastAPI 股票分析服务构建。

**🚀 专业级股票分析系统**：集成13大技术分析方法，包含爱德华兹趋势分析、墨菲市场间分析、日本蜡烛图分析等经典理论，为投资决策提供华尔街级别的专业支持。

## 项目特色

- 🎯 **全栈技术栈**: React + Koa.js + Python 多语言协作
- 📊 **专业股票分析**: 13大技术分析方法 + 基本面分析
  - 集成三大经典技术分析理论
  - 爱德华兹趋势分析、墨菲市场间分析、日本蜡烛图分析
  - 专业级投资决策支持
- 🔄 **实时数据**: 多数据源容错机制
- 📱 **响应式设计**: 三列布局 + 移动端自适应
- 🛡️ **数据安全**: JWT认证 + 数据加密
- ⚡ **高性能**: Redis缓存 + 异步处理
- 🎨 **现代UI**: Tailwind CSS + 组件化设计
- 📈 **华尔街级分析**: 达到专业投资机构分析深度

## 项目架构

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   博客后端       │    │  股票分析服务    │
│  React + Vite   │◄──►│ Node.js + Koa   │    │ Python + FastAPI│
│   Port: 5173    │    │   Port: 3001    │    │   Port: 8001    │
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
- **TA-Lib** - 专业技术分析指标库
- **NumPy** - 数值计算和数组处理
- **SciPy** - 科学计算和统计分析
- **EFinance** - 东方财富数据接口
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
- 📈 **13大专业技术分析方法**

  **经典技术指标 (5个)**
  - MACD (指数平滑移动平均线) - 趋势跟踪和动量分析
  - KDJ (随机指标) - 超买超卖判断
  - RSI (相对强弱指标) - 价格强弱度量
  - 布林带 (Bollinger Bands) - 价格通道和波动性分析
  - 威廉指标 (Williams %R) - 超买超卖确认

  **趋势分析方法 (5个)**
  - 移动平均线 (MA5, MA10, MA20, MA60) - 趋势方向判断
  - 量能分析 (Volume Analysis) - 成交量配合确认
  - 江恩线 (Gann Lines) - 时间价格关系分析
  - 爱德华兹趋势分析 (Edwards Trend) - 趋势线和经典形态识别
  - 艾略特波浪理论 (Elliott Wave) - 波浪结构和周期分析

  **现代分析理论 (3个)**
  - 换手率分析 (Turnover Rate) - 市场活跃度和资金流向
  - 墨菲市场间分析 (Murphy Intermarket) - 多时间框架趋势分析
  - 日本蜡烛图分析 (Japanese Candlestick) - K线形态和反转信号

- 💰 **基本面分析功能**
  - 公司信息 (Company Info) - 名称、行业、板块、交易市场、市值
  - 财务数据 (Financial Data) - 营收、净利润、PE、PB、ROE、股息率
  - 估值分析 (Valuation Analysis) - 估值水平、目标价、上涨空间
  - 成长性分析 (Growth Analysis) - 成长率、成长质量、可持续性
  - 盈利能力 (Profitability Analysis) - ROE水平、利润率、资产周转
  - 财务健康 (Financial Health) - 负债率、流动比率、健康评分
  - 行业分析 (Industry Analysis) - 行业趋势、竞争地位、市场份额
  - 投资亮点和风险因素 - 全面的投资决策支持

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
- **经典理论集成**:
  - 罗伯特·D·爱德华兹股市趋势技术分析
  - 约翰·墨菲金融市场技术分析（市场间分析）
  - 日本蜡烛图技术分析
- **多维度分析**:
  - 经典技术指标：MACD、KDJ、RSI、布林带、威廉指标
  - 趋势分析：均线、量能、江恩线、爱德华兹趋势、艾略特波浪
  - 现代分析：换手率、墨菲市场间、日本蜡烛图
- **智能预警**: 基于技术指标的智能预警系统
- **三列布局展示**: 经典指标、趋势分析、现代分析分类展示

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
- **AnalysisService** - 13大技术分析方法计算和分析
  - 经典技术指标：MACD、KDJ、RSI、布林带、威廉指标
  - 趋势分析方法：均线、量能、江恩线、爱德华兹趋势、艾略特波浪
  - 现代分析理论：换手率、墨菲市场间、日本蜡烛图
- **BacktestService** - 策略回测和性能评估
- **TechnicalAnalysis** - TA-Lib技术分析工具封装
- **FundamentalAnalysis** - 基本面分析模块
  - 公司信息、财务数据、估值分析
  - 成长性分析、盈利能力、财务健康
  - 行业分析、投资亮点、风险因素

## 技术分析理论详解

### 经典技术分析理论

#### 🔵 罗伯特·D·爱德华兹股市趋势技术分析 (Edwards Trend Analysis)
- **趋势线分析**: 计算趋势斜率和相关性，判断上升/下降/横盘趋势
- **支撑阻力位**: 自动识别关键支撑位和阻力位，基于局部高低点计算
- **经典形态识别**: 头肩顶/头肩底、双顶/双底形态，成交量确认分析
- **趋势强度评估**: 强/中等/弱趋势强度判断

#### 🔵 约翰·墨菲金融市场技术分析 (Murphy Intermarket Analysis)
- **多时间框架分析**: 短期(5日)、中期(20日)、长期(60日)趋势分析
- **趋势一致性判断**: 多头排列/空头排列/趋势分歧识别
- **动量分析**: 多周期动量计算，动量强度评级
- **相对强度分析**: 个股与大盘相对表现，市场结构分析

#### 🔵 日本蜡烛图技术分析 (Japanese Candlestick Analysis)
- **单根K线形态**: 十字星、锤子线、射击之星、长阳线/长阴线、纺锤线
- **多根K线组合**: 早晨之星/黄昏之星、看涨吞没/看跌吞没、乌云盖顶/刺透形态
- **形态强度评估**: 形态强度评级（强/中等/弱）
- **概率分析**: 反转概率和持续概率评估，整体市场情绪判断

### 前端展示架构

#### 🎨 三列布局设计
- **第一列 - 经典技术指标**: MACD、KDJ、RSI、布林带、威廉指标
- **第二列 - 趋势分析**: 均线、量能、江恩线、爱德华兹趋势、艾略特波浪
- **第三列 - 现代分析**: 换手率、墨菲市场间、日本蜡烛图

#### 🎯 组件化设计
- **TechnicalAnalysisGrid**: 三列技术分析网格组件
- **GannChart**: 独立江恩线图表组件
- **FundamentalsChart**: 基本面分析图表组件
- **响应式布局**: 桌面端三列，移动端单列自适应

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

## 更新日志

### v2.0.0 - 专业技术分析升级 🚀

#### 新增功能
- ✨ **13大技术分析方法**: 从8个指标扩展到13个专业分析方法
- 🔵 **三大经典理论集成**:
  - 罗伯特·D·爱德华兹股市趋势技术分析
  - 约翰·墨菲金融市场技术分析（市场间分析）
  - 日本蜡烛图技术分析
- 🎨 **三列布局设计**: 经典指标、趋势分析、现代分析分类展示
- 💰 **完整基本面分析**: 7大维度全面分析
- 📊 **独立江恩线图表**: 专业的时间价格分析

#### 技术改进
- 🏗️ **组件化重构**: TechnicalAnalysisGrid、GannChart等独立组件
- 📱 **响应式优化**: 桌面端三列，移动端自适应
- 🎯 **专业级分析**: 达到华尔街投资机构分析深度
- 🔧 **模块化设计**: 更好的代码组织和维护性

#### 分析方法详解
**经典技术指标 (5个)**
- MACD、KDJ、RSI、布林带、威廉指标

**趋势分析方法 (5个)**
- 均线、量能、江恩线、爱德华兹趋势、艾略特波浪

**现代分析理论 (3个)**
- 换手率、墨菲市场间、日本蜡烛图

## 🚀 部署指南

### 🐳 Docker部署（推荐）

#### 快速部署
```bash
# 克隆项目
git clone https://github.com/your-username/PennyProse.git
cd PennyProse

# 复制环境配置
cp .env.example .env
# 编辑 .env 文件，设置你的配置

# 一键部署
chmod +x deploy.sh
./deploy.sh
```

#### 手动Docker部署
```bash
# 开发环境
docker-compose up --build

# 生产环境
docker-compose -f docker-compose.prod.yml up --build -d
```

### ☁️ 云平台部署

#### GitHub Actions自动部署
1. Fork本项目到你的GitHub账户
2. 在GitHub仓库设置中添加以下Secrets：
   ```
   DOCKER_USERNAME=你的Docker Hub用户名
   DOCKER_PASSWORD=你的Docker Hub密码
   RAILWAY_TOKEN=你的Railway令牌
   HEROKU_API_KEY=你的Heroku API密钥
   HEROKU_EMAIL=你的Heroku邮箱
   JWT_SECRET=你的JWT密钥
   ```
3. 推送代码到main分支，自动触发部署

#### Railway部署（推荐）
1. 连接GitHub仓库到Railway
2. 分别部署三个服务：
   - Frontend: `frontend/`
   - Backend: `backend/`
   - Stock API: `stock-analysis/`

#### Vercel部署（前端）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署前端
cd frontend
vercel --prod
```

### 🔧 环境配置

#### 必需的环境变量
```bash
# 数据库
DATABASE_URL=postgresql://user:pass@host:port/db
POSTGRES_PASSWORD=your-secure-password

# 安全
JWT_SECRET=your-jwt-secret-key

# 应用
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### 📊 监控和维护

#### 服务健康检查
```bash
# 检查所有服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]
```

#### 数据备份
```bash
# 备份PostgreSQL数据库
docker-compose exec postgres pg_dump -U postgres pennyprose > backup.sql

# 备份SQLite数据库
docker-compose exec stock-analysis cp /app/database/stock_analysis.db /backup/
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License
