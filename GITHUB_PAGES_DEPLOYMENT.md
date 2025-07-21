# GitHub Pages 部署指南

## 概述

PennyProse 前端现在配置为部署到 GitHub Pages。由于 GitHub Pages 只支持静态网站，我们只部署前端应用，后端服务需要单独部署。

## 部署配置

### 1. GitHub Pages 设置

1. 进入 GitHub 仓库设置
2. 找到 "Pages" 部分
3. 选择 "GitHub Actions" 作为源
4. 保存设置

### 2. 自动部署

每次推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. 安装依赖 (pnpm)
2. 构建前端应用 (Vite)
3. 部署到 GitHub Pages

### 3. 访问地址

部署完成后，应用将在以下地址可用：
- **主域名**: https://yangwenxu.github.io/PennyProse/

## 技术配置

### Vite 配置

```javascript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/PennyProse/' : '/',
  // ... 其他配置
})
```

### React Router 配置

```javascript
function App() {
  const basename = import.meta.env.PROD ? '/PennyProse' : '';
  return (
    <Router basename={basename}>
      {/* 路由配置 */}
    </Router>
  );
}
```

### API 配置

```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://api.yangwenxu.github.io'  // 生产环境API
  : 'http://localhost:3001'            // 开发环境API
```

## 后端部署

由于 GitHub Pages 只支持静态网站，后端服务需要单独部署：

### 推荐的后端部署选项

1. **Vercel** - 支持 Node.js 和 Python
2. **Netlify Functions** - 无服务器函数
3. **Railway** - 全栈应用部署
4. **Heroku** - 传统云平台
5. **DigitalOcean App Platform** - 容器化部署

### 后端部署步骤

1. 选择部署平台
2. 配置环境变量
3. 设置数据库连接
4. 更新前端 API_BASE_URL
5. 配置 CORS 允许 GitHub Pages 域名

## 环境变量

### 前端环境变量

在 GitHub Actions 中自动设置：
- `NODE_ENV=production`
- `VITE_BASE_URL=/PennyProse/`

### 后端环境变量

需要在后端部署平台配置：
- `DATABASE_URL` - 数据库连接字符串
- `JWT_SECRET` - JWT 密钥
- `CORS_ORIGIN` - 允许的前端域名

## 开发工作流

### 本地开发

```bash
# 前端开发
cd frontend
pnpm install
pnpm dev

# 后端开发
cd backend
pnpm install
pnpm dev

# Python 服务开发
cd stock-analysis
pip install -r requirements.txt
python main.py
```

### 部署流程

1. 开发完成后推送到 `main` 分支
2. GitHub Actions 自动构建和部署前端
3. 手动部署后端到选择的平台
4. 更新 API 配置指向新的后端地址

## 故障排除

### 常见问题

1. **路由 404 错误**
   - 确保 `basename` 配置正确
   - 检查 GitHub Pages 设置

2. **API 请求失败**
   - 检查后端是否正常运行
   - 验证 CORS 配置
   - 确认 API_BASE_URL 正确

3. **静态资源加载失败**
   - 检查 Vite `base` 配置
   - 确认资源路径正确

### 调试步骤

1. 检查 GitHub Actions 构建日志
2. 使用浏览器开发者工具检查网络请求
3. 验证部署的文件结构
4. 测试 API 端点连接

## 监控和维护

### 性能监控

- 使用 GitHub Pages 内置分析
- 配置 Google Analytics（可选）
- 监控 API 响应时间

### 更新流程

1. 定期更新依赖包
2. 监控安全漏洞
3. 优化构建性能
4. 备份重要数据

## 成本考虑

- **GitHub Pages**: 免费（公共仓库）
- **后端部署**: 根据选择的平台而定
- **域名**: 可选，使用自定义域名
- **数据库**: 根据使用量和提供商而定
