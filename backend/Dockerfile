# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 安装pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制package文件和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --no-frozen-lockfile --prod

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN pnpm db:generate

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 创建必要的目录并设置权限
RUN mkdir -p /app/uploads /app/logs
RUN chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["pnpm", "start"]
