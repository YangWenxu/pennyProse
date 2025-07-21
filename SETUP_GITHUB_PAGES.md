# GitHub Pages 设置指南

## 问题说明

如果遇到以下错误：
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions
```

这表明GitHub Pages还没有在仓库中启用。

## 解决方案

### 方案1：手动启用GitHub Pages（推荐）

1. **进入仓库设置**
   - 打开GitHub仓库页面
   - 点击 "Settings" 标签

2. **找到Pages设置**
   - 在左侧菜单中找到 "Pages"
   - 点击进入Pages设置页面

3. **配置部署源**
   - 在 "Source" 部分选择 "GitHub Actions"
   - 保存设置

4. **触发部署**
   - 推送代码到main分支
   - 或者在Actions页面手动运行workflow

### 方案2：使用简化的部署工作流

我们提供了两个部署工作流：

#### A. 标准工作流 (deploy-pages.yml)
- 使用官方GitHub Pages actions
- 需要手动启用Pages
- 更完整的配置

#### B. 简化工作流 (deploy-simple.yml)
- 使用第三方action (peaceiris/actions-gh-pages)
- 自动创建gh-pages分支
- 无需预先启用Pages

### 方案3：使用简化工作流

如果标准工作流有问题，可以使用简化版本：

1. **禁用当前工作流**
   ```bash
   # 重命名或删除当前工作流
   mv .github/workflows/deploy-pages.yml .github/workflows/deploy-pages.yml.disabled
   ```

2. **启用简化工作流**
   ```bash
   # 重命名简化工作流
   mv .github/workflows/deploy-simple.yml .github/workflows/deploy-pages.yml
   ```

3. **推送更改**
   ```bash
   git add .
   git commit -m "Switch to simplified GitHub Pages deployment"
   git push origin main
   ```

## 验证部署

### 检查部署状态

1. **GitHub Actions**
   - 进入仓库的 "Actions" 标签
   - 查看最新的workflow运行状态
   - 检查是否有错误信息

2. **Pages设置**
   - 进入 "Settings" > "Pages"
   - 查看部署状态和URL
   - 确认源设置正确

3. **访问网站**
   - 部署成功后访问：https://yangwenxu.github.io/PennyProse/
   - 检查页面是否正常加载

### 常见问题排查

#### 1. 权限问题
确保仓库有正确的权限设置：
- 进入 "Settings" > "Actions" > "General"
- 在 "Workflow permissions" 中选择 "Read and write permissions"
- 勾选 "Allow GitHub Actions to create and approve pull requests"

#### 2. 分支问题
确保推送到正确的分支：
- 默认分支应该是 `main` 或 `master`
- 检查workflow触发条件

#### 3. 构建问题
检查构建日志：
- 查看Actions页面的详细日志
- 确认依赖安装成功
- 验证构建输出

## 自定义域名（可选）

如果要使用自定义域名：

1. **添加CNAME文件**
   ```bash
   echo "your-domain.com" > frontend/public/CNAME
   ```

2. **配置DNS**
   - 添加CNAME记录指向 `yangwenxu.github.io`
   - 或添加A记录指向GitHub Pages IP

3. **在GitHub设置自定义域名**
   - 进入 "Settings" > "Pages"
   - 在 "Custom domain" 中输入域名
   - 启用 "Enforce HTTPS"

## 监控和维护

### 定期检查

1. **依赖更新**
   - 定期更新npm包
   - 检查安全漏洞

2. **性能监控**
   - 使用GitHub Pages分析
   - 监控加载速度

3. **错误监控**
   - 检查浏览器控制台错误
   - 监控API调用失败

### 备份策略

1. **代码备份**
   - 定期推送到GitHub
   - 考虑多个远程仓库

2. **配置备份**
   - 记录重要的配置设置
   - 备份环境变量

## 故障恢复

如果部署失败：

1. **回滚到上一个版本**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **检查和修复问题**
   - 查看错误日志
   - 修复代码问题
   - 重新部署

3. **联系支持**
   - 如果是GitHub Pages问题
   - 查看GitHub Status页面
