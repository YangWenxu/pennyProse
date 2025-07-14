# PennyProse - 创作与分析的完美融合

一个集博客创作与股票分析于一体的现代化平台，基于 React + Vite 前端和 Node.js + Koa 后端构建。

## 项目架构

```
pennyprose/
├── frontend/          # React + Vite 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 hooks
│   │   ├── utils/        # 工具函数
│   │   ├── styles/       # 样式文件
│   │   └── api/          # API 调用
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Koa 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由定义
│   │   ├── middleware/   # 中间件
│   │   ├── utils/        # 工具函数
│   │   └── config/       # 配置文件
│   ├── migrations/       # 数据库迁移
│   └── package.json
├── shared/            # 共享类型定义和工具
└── docs/              # 项目文档
```

## 技术栈

### 前端
- **React 18** - 用户界面库
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP 客户端
- **React Query** - 数据获取和缓存
- **React Hook Form** - 表单处理
- **React Markdown** - Markdown 渲染

### 后端
- **Node.js** - 运行时环境
- **Koa.js** - Web 框架
- **Koa Router** - 路由中间件
- **Prisma** - ORM 和数据库工具
- **SQLite/PostgreSQL** - 数据库
- **JWT** - 身份验证
- **Bcrypt** - 密码加密
- **Joi** - 数据验证

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
- 📈 专业技术指标分析（MACD、KDJ、RSI等）
- ⭐ 自选股管理
- 🔔 智能预警系统
- 🎯 策略回测功能
- 📊 基本面分析
- 📉 江恩线分析
- 💹 实时数据监控

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
- Node.js >= 16
- npm 或 yarn

### 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd pennyprose
```

2. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 启动开发服务器
```bash
# 启动后端服务 (端口 3001)
cd backend
npm run dev

# 启动前端服务 (端口 5173)
cd frontend
npm run dev
```

## 许可证

MIT License
