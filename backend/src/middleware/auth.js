import jwt from 'jsonwebtoken'

// Middleware to verify JWT token
export const requireAuth = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      ctx.status = 401
      ctx.body = { error: 'Access token required' }
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await ctx.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        bio: true
      }
    })

    if (!user) {
      ctx.status = 401
      ctx.body = { error: 'Invalid token' }
      return
    }

    ctx.user = user
    await next()
  } catch (err) {
    ctx.status = 401
    ctx.body = { error: 'Invalid token' }
  }
}

// Middleware to check if user is admin
export const requireAdmin = async (ctx, next) => {
  if (ctx.user?.role !== 'ADMIN') {
    ctx.status = 403
    ctx.body = { error: 'Admin access required' }
    return
  }
  await next()
}

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await ctx.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          avatar: true,
          bio: true
        }
      })
      
      if (user) {
        ctx.user = user
      }
    }
  } catch (err) {
    // Ignore auth errors for optional auth
  }
  
  await next()
}

export default { requireAuth, requireAdmin, optionalAuth }
