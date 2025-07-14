import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'
import json from 'koa-json'
import serve from 'koa-static'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Import routes (commented out for debugging)
// import authRoutes from './routes/auth.js'
// import postRoutes from './routes/posts.js'
// import categoryRoutes from './routes/categories.js'
// import tagRoutes from './routes/tags.js'
// import userRoutes from './routes/users.js'

// Import middleware
import errorHandler from './middleware/errorHandler.js'
import authMiddleware from './middleware/auth.js'

// Load environment variables
dotenv.config()

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Koa app
const app = new Koa()

// Global middleware
app.use(errorHandler)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(json())
app.use(bodyParser())

// Serve static files
app.use(serve('public'))

// Add Prisma to context
app.use(async (ctx, next) => {
  ctx.prisma = prisma
  await next()
})

// Health check endpoint (before other routes)
app.use(async (ctx, next) => {
  console.log('Request path:', ctx.path)
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

// Routes (commented out for debugging)
// app.use(authRoutes.routes())
// app.use(authRoutes.allowedMethods())

// app.use(postRoutes.routes())
// app.use(postRoutes.allowedMethods())

// app.use(categoryRoutes.routes())
// app.use(categoryRoutes.allowedMethods())

// app.use(tagRoutes.routes())
// app.use(tagRoutes.allowedMethods())

// app.use(userRoutes.routes())
// app.use(userRoutes.allowedMethods())

// 404 handler
app.use(async (ctx) => {
  console.log('404 handler reached for path:', ctx.path)
  ctx.status = 404
  ctx.body = { error: 'Not Found' }
})

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: SQLite`)
})

export default app
