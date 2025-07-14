import Router from 'koa-router'
import Joi from 'joi'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/categories' })

// Validation schemas
const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i)
})

const updateCategorySchema = createCategorySchema.fork(['name'], (schema) => schema.optional())

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Get all categories (public)
router.get('/', async (ctx) => {
  try {
    const categories = await ctx.prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const transformedCategories = categories.map(category => ({
      ...category,
      postCount: category._count.posts
    }))

    ctx.body = { categories: transformedCategories }
  } catch (err) {
    console.error('Error fetching categories:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch categories' }
  }
})

// Get single category by slug (public)
router.get('/:slug', async (ctx) => {
  try {
    const { slug } = ctx.params

    const category = await ctx.prisma.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { status: 'PUBLISHED' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    if (!category) {
      ctx.status = 404
      ctx.body = { error: 'Category not found' }
      return
    }

    const transformedCategory = {
      ...category,
      postCount: category._count.posts,
      posts: category.posts.map(post => ({
        ...post,
        commentCount: post._count.comments
      }))
    }

    ctx.body = { category: transformedCategory }
  } catch (err) {
    console.error('Error fetching category:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch category' }
  }
})

// Create category (admin only)
router.post('/', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { error, value } = createCategorySchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, slug, description, color } = value

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name)

    // Check if category with this name or slug already exists
    const existingCategory = await ctx.prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug: finalSlug }
        ]
      }
    })

    if (existingCategory) {
      ctx.status = 400
      ctx.body = { error: 'Category with this name or slug already exists' }
      return
    }

    const category = await ctx.prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        color
      }
    })

    ctx.body = {
      message: 'Category created successfully',
      category
    }
  } catch (err) {
    console.error('Error creating category:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to create category' }
  }
})

// Update category (admin only)
router.put('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params
    const { error, value } = updateCategorySchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, slug, description, color } = value

    // Check if category exists
    const existingCategory = await ctx.prisma.category.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCategory) {
      ctx.status = 404
      ctx.body = { error: 'Category not found' }
      return
    }

    // Generate slug if name changed
    const finalSlug = slug || (name ? generateSlug(name) : existingCategory.slug)

    // Check for conflicts
    if (name !== existingCategory.name || finalSlug !== existingCategory.slug) {
      const conflict = await ctx.prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                { slug: finalSlug }
              ]
            }
          ]
        }
      })

      if (conflict) {
        ctx.status = 400
        ctx.body = { error: 'Category with this name or slug already exists' }
        return
      }
    }

    const category = await ctx.prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        slug: finalSlug,
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color })
      }
    })

    ctx.body = {
      message: 'Category updated successfully',
      category
    }
  } catch (err) {
    console.error('Error updating category:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update category' }
  }
})

// Delete category (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params

    const category = await ctx.prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!category) {
      ctx.status = 404
      ctx.body = { error: 'Category not found' }
      return
    }

    if (category._count.posts > 0) {
      ctx.status = 400
      ctx.body = { error: 'Cannot delete category with existing posts' }
      return
    }

    await ctx.prisma.category.delete({
      where: { id: parseInt(id) }
    })

    ctx.body = { message: 'Category deleted successfully' }
  } catch (err) {
    console.error('Error deleting category:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to delete category' }
  }
})

export default router
