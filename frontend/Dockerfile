# 多阶段构建：构建阶段
FROM node:18-alpine AS builder

# 安装pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制package文件和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段：使用nginx提供静态文件
FROM nginx:alpine

# 复制构建产物到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
