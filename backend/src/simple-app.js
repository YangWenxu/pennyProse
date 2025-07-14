import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'
import json from 'koa-json'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
dotenv.config()

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Koa app
const app = new Koa()

// Global middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(json())
app.use(bodyParser())

// Add Prisma to context
app.use(async (ctx, next) => {
  ctx.prisma = prisma
  await next()
})

// Health check endpoint
app.use(async (ctx, next) => {
  console.log('Request received:', ctx.method, ctx.path)
  if (ctx.path === '/health') {
    ctx.body = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
    return
  }
  await next()
})

// Get all posts
app.use(async (ctx, next) => {
  if (ctx.path === '/api/posts' && ctx.method === 'GET') {
    try {
      // 获取分页参数
      const page = parseInt(ctx.query.page) || 1
      const limit = parseInt(ctx.query.limit) || 10
      const skip = (page - 1) * limit

      console.log('分页参数:', { page, limit, skip })

      // 获取总数
      const total = await ctx.prisma.post.count({
        where: { status: 'PUBLISHED' }
      })

      // 获取分页数据
      const posts = await ctx.prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Transform posts to include tags directly
      const transformedPosts = posts.map(post => ({
        ...post,
        tags: post.tags.map(pt => pt.tag),
        commentCount: post._count.comments
      }))

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }

      console.log('返回分页信息:', pagination)

      ctx.body = {
        posts: transformedPosts,
        pagination
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      ctx.status = 500
      ctx.body = { error: 'Failed to fetch posts' }
    }
    return
  }
  await next()
})

// Get single post by slug
app.use(async (ctx, next) => {
  const match = ctx.path.match(/^\/api\/posts\/(.+)$/)
  if (match && ctx.method === 'GET') {
    try {
      const slug = match[1]
      const post = await ctx.prisma.post.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              bio: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          }
        }
      })

      if (!post) {
        ctx.status = 404
        ctx.body = { error: 'Post not found' }
        return
      }

      // Increment view count
      await ctx.prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      })

      // Transform post
      const transformedPost = {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }

      ctx.body = { post: transformedPost }
    } catch (err) {
      console.error('Error fetching post:', err)
      ctx.status = 500
      ctx.body = { error: 'Failed to fetch post' }
    }
    return
  }
  await next()
})

// 404 handler
app.use(async (ctx) => {
  console.log('404 handler reached for path:', ctx.path)
  ctx.status = 404
  ctx.body = { error: 'Not Found' }
})

const PORT = 3005

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: SQLite`)
})

export default app
