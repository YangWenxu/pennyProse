import Router from 'koa-router'
import Joi from 'joi'
import bcrypt from 'bcryptjs'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/users' })

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  bio: Joi.string().max(500),
  avatar: Joi.string().uri()
})

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
})

const adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  bio: Joi.string().max(500),
  avatar: Joi.string().uri(),
  role: Joi.string().valid('USER', 'ADMIN', 'MODERATOR')
})

// Get all users (admin only)
router.get('/', requireAuth, requireAdmin, async (ctx) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role
    } = ctx.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Build where clause
    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [users, total] = await Promise.all([
      ctx.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      ctx.prisma.user.count({ where })
    ])

    const transformedUsers = users.map(user => ({
      ...user,
      postCount: user._count.posts,
      commentCount: user._count.comments
    }))

    ctx.body = {
      users: transformedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch users' }
  }
})

// Get single user by username (public)
router.get('/:username', async (ctx) => {
  try {
    const { username } = ctx.params

    const user = await ctx.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        posts: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
            readTime: true,
            viewCount: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          },
          orderBy: { publishedAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' }
            },
            comments: true
          }
        }
      }
    })

    if (!user) {
      ctx.status = 404
      ctx.body = { error: 'User not found' }
      return
    }

    const transformedUser = {
      ...user,
      postCount: user._count.posts,
      commentCount: user._count.comments,
      posts: user.posts.map(post => ({
        ...post,
        commentCount: post._count.comments
      }))
    }

    ctx.body = { user: transformedUser }
  } catch (err) {
    console.error('Error fetching user:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch user' }
  }
})

// Update own profile
router.put('/profile', requireAuth, async (ctx) => {
  try {
    const { error, value } = updateProfileSchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, bio, avatar } = value

    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })

    ctx.body = {
      message: 'Profile updated successfully',
      user
    }
  } catch (err) {
    console.error('Error updating profile:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update profile' }
  }
})

// Update password
router.put('/password', requireAuth, async (ctx) => {
  try {
    const { error, value } = updatePasswordSchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { currentPassword, newPassword } = value

    // Get current user with password
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id }
    })

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)

    if (!isValidPassword) {
      ctx.status = 400
      ctx.body = { error: 'Current password is incorrect' }
      return
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: { password: hashedPassword }
    })

    ctx.body = { message: 'Password updated successfully' }
  } catch (err) {
    console.error('Error updating password:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update password' }
  }
})

// Update user (admin only)
router.put('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params
    const { error, value } = adminUpdateUserSchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, bio, avatar, role } = value

    // Check if user exists
    const existingUser = await ctx.prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      ctx.status = 404
      ctx.body = { error: 'User not found' }
      return
    }

    const user = await ctx.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(role !== undefined && { role })
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })

    ctx.body = {
      message: 'User updated successfully',
      user
    }
  } catch (err) {
    console.error('Error updating user:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update user' }
  }
})

// Delete user (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params

    // Prevent admin from deleting themselves
    if (parseInt(id) === ctx.user.id) {
      ctx.status = 400
      ctx.body = { error: 'Cannot delete your own account' }
      return
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!user) {
      ctx.status = 404
      ctx.body = { error: 'User not found' }
      return
    }

    await ctx.prisma.user.delete({
      where: { id: parseInt(id) }
    })

    ctx.body = { message: 'User deleted successfully' }
  } catch (err) {
    console.error('Error deleting user:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to delete user' }
  }
})

export default router
