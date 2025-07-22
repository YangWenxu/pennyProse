# Vercel 免费部署指南

## 🆓 Vercel 免费计划详情

### 免费额度 (Hobby Plan)
- **带宽**: 100GB/月 (足够中小型应用)
- **函数执行时间**: 100GB-Hrs/月 (约100万次调用)
- **构建时间**: 6000分钟/月
- **项目数量**: 无限制
- **自定义域名**: ✅ 支持
- **HTTPS**: ✅ 自动配置
- **全球CDN**: ✅ 免费

### 对我们项目的适用性
- ✅ **Node.js后端**: 完全支持
- ✅ **API路由**: 支持 `/api/*` 
- ✅ **数据库连接**: 支持外部数据库
- ✅ **环境变量**: 完全支持
- ✅ **文件上传**: 支持 (有大小限制)

## 🚀 部署步骤

### 1. 准备工作

#### A. 注册 Vercel 账户
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录 (推荐)
3. 选择 "Hobby" 免费计划

#### B. 安装 Vercel CLI (可选)
```bash
npm i -g vercel
```

### 2. 部署方式

#### 方式1: GitHub 集成 (推荐)
1. **连接 GitHub**
   - 在 Vercel 控制台点击 "New Project"
   - 选择你的 GitHub 仓库
   - 选择 `backend` 目录作为根目录

2. **配置构建设置**
   ```
   Framework Preset: Other
   Root Directory: backend
   Build Command: pnpm install
   Output Directory: (留空)
   Install Command: pnpm install
   ```

3. **环境变量配置**
   ```
   NODE_ENV=production
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

#### 方式2: CLI 部署
```bash
cd backend
vercel --prod
```

### 3. 数据库选择

#### A. 免费数据库选项

**1. Vercel Postgres (推荐)**
- **免费额度**: 60小时计算时间/月
- **存储**: 256MB
- **连接数**: 60个并发连接
- **集成**: 与Vercel完美集成

**2. PlanetScale (MySQL)**
- **免费额度**: 5GB存储
- **连接数**: 1000/月
- **分支**: 1个生产分支

**3. Supabase (PostgreSQL)**
- **免费额度**: 500MB数据库
- **API请求**: 50,000/月
- **认证用户**: 50,000

**4. Railway**
- **免费额度**: $5/月使用额度
- **数据库**: PostgreSQL/MySQL

#### B. 推荐配置: Vercel + Vercel Postgres
```bash
# 在 Vercel 控制台中
1. 进入项目设置
2. 点击 "Storage" 标签
3. 创建 "Postgres" 数据库
4. 自动获得 DATABASE_URL
```

### 4. 环境变量配置

在 Vercel 项目设置中添加：

```env
# 数据库
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
CORS_ORIGIN=https://yangwenxu.github.io

# Node环境
NODE_ENV=production
```

### 5. 部署后配置

#### A. 获取API地址
部署成功后，你会得到类似这样的地址：
```
https://pennyprose-api-username.vercel.app
```

#### B. 更新前端配置
修改 `frontend/src/api/client.js`:
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-actual-vercel-url.vercel.app'  // 替换为实际地址
  : 'http://localhost:3001'
```

#### C. 配置自定义域名 (可选)
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名 (如: api.yangwenxu.com)
3. 配置 DNS 记录

## 💡 优化建议

### 1. 冷启动优化
```javascript
// 在 main.js 中添加
export default async function handler(req, res) {
  // 保持函数温热
  if (req.url === '/api/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
  
  // 其他路由处理...
}
```

### 2. 数据库连接优化
```javascript
// 使用连接池
const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}
```

### 3. 缓存策略
```javascript
// 在响应头中添加缓存
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

## 📊 成本估算

### 免费计划足够的情况
- **个人博客**: ✅ 完全够用
- **小型项目**: ✅ 绰绰有余
- **中等流量**: ✅ 月访问量 < 10万

### 可能需要升级的情况
- **高流量**: 月访问量 > 50万
- **大文件处理**: 频繁上传大文件
- **长时间计算**: 复杂的数据处理

### Pro 计划 ($20/月)
- **带宽**: 1TB/月
- **函数时间**: 1000GB-Hrs/月
- **团队协作**: 支持
- **高级分析**: 详细统计

## 🔧 故障排除

### 常见问题

1. **函数超时**
   - 免费计划限制10秒
   - 优化数据库查询
   - 使用异步处理

2. **冷启动慢**
   - 使用健康检查保持温热
   - 优化依赖包大小

3. **数据库连接问题**
   - 检查连接字符串
   - 确认防火墙设置

### 监控和调试
```javascript
// 添加日志
console.log('API Request:', req.method, req.url);
console.log('Environment:', process.env.NODE_ENV);
```

## 🎯 部署检查清单

- [ ] Vercel 账户已创建
- [ ] GitHub 仓库已连接
- [ ] 数据库已配置
- [ ] 环境变量已设置
- [ ] 前端 API 地址已更新
- [ ] CORS 已正确配置
- [ ] 健康检查端点正常
- [ ] 数据库迁移已运行
