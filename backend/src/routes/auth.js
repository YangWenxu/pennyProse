import Router from 'koa-router'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { requireAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/auth' })

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  name: Joi.string().min(1).max(100),
  password: Joi.string().min(6).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Register
router.post('/register', async (ctx) => {
  const { error, value } = registerSchema.validate(ctx.request.body)
  
  if (error) {
    ctx.status = 400
    ctx.body = { error: error.details[0].message }
    return
  }

  const { email, username, name, password } = value

  try {
    // Check if user already exists
    const existingUser = await ctx.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      ctx.status = 400
      ctx.body = { error: 'User with this email or username already exists' }
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    ctx.body = {
      message: 'User registered successfully',
      user,
      token
    }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: 'Failed to register user' }
  }
})

// Login
router.post('/login', async (ctx) => {
  const { error, value } = loginSchema.validate(ctx.request.body)
  
  if (error) {
    ctx.status = 400
    ctx.body = { error: error.details[0].message }
    return
  }

  const { email, password } = value

  try {
    // Find user
    const user = await ctx.prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      ctx.status = 401
      ctx.body = { error: 'Invalid credentials' }
      return
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      ctx.status = 401
      ctx.body = { error: 'Invalid credentials' }
      return
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    ctx.body = {
      message: 'Login successful',
      user: userWithoutPassword,
      token
    }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: 'Failed to login' }
  }
})

// Get current user
router.get('/me', requireAuth, async (ctx) => {
  ctx.body = { user: ctx.user }
})

// Refresh token
router.post('/refresh', requireAuth, async (ctx) => {
  try {
    const token = jwt.sign(
      { userId: ctx.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    ctx.body = { token }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: 'Failed to refresh token' }
  }
})

export default router
