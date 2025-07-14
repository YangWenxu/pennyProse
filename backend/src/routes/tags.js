import Router from 'koa-router'
import Joi from 'joi'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/tags' })

// Validation schemas
const createTagSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  slug: Joi.string().min(1).max(50),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i)
})

const updateTagSchema = createTagSchema.fork(['name'], (schema) => schema.optional())

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Get all tags (public)
router.get('/', async (ctx) => {
  try {
    const tags = await ctx.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const transformedTags = tags.map(tag => ({
      ...tag,
      postCount: tag._count.posts
    }))

    ctx.body = { tags: transformedTags }
  } catch (err) {
    console.error('Error fetching tags:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch tags' }
  }
})

// Get single tag by slug (public)
router.get('/:slug', async (ctx) => {
  try {
    const { slug } = ctx.params

    const tag = await ctx.prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: {
            post: { status: 'PUBLISHED' }
          },
          include: {
            post: {
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
                _count: {
                  select: {
                    comments: true
                  }
                }
              }
            }
          },
          orderBy: { post: { createdAt: 'desc' } },
          take: 10
        },
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      }
    })

    if (!tag) {
      ctx.status = 404
      ctx.body = { error: 'Tag not found' }
      return
    }

    const transformedTag = {
      ...tag,
      postCount: tag._count.posts,
      posts: tag.posts.map(pt => ({
        ...pt.post,
        commentCount: pt.post._count.comments
      }))
    }

    ctx.body = { tag: transformedTag }
  } catch (err) {
    console.error('Error fetching tag:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch tag' }
  }
})

// Create tag (admin only)
router.post('/', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { error, value } = createTagSchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, slug, color } = value

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name)

    // Check if tag with this name or slug already exists
    const existingTag = await ctx.prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug: finalSlug }
        ]
      }
    })

    if (existingTag) {
      ctx.status = 400
      ctx.body = { error: 'Tag with this name or slug already exists' }
      return
    }

    const tag = await ctx.prisma.tag.create({
      data: {
        name,
        slug: finalSlug,
        color
      }
    })

    ctx.body = {
      message: 'Tag created successfully',
      tag
    }
  } catch (err) {
    console.error('Error creating tag:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to create tag' }
  }
})

// Update tag (admin only)
router.put('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params
    const { error, value } = updateTagSchema.validate(ctx.request.body)
    
    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { name, slug, color } = value

    // Check if tag exists
    const existingTag = await ctx.prisma.tag.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingTag) {
      ctx.status = 404
      ctx.body = { error: 'Tag not found' }
      return
    }

    // Generate slug if name changed
    const finalSlug = slug || (name ? generateSlug(name) : existingTag.slug)

    // Check for conflicts
    if (name !== existingTag.name || finalSlug !== existingTag.slug) {
      const conflict = await ctx.prisma.tag.findFirst({
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
        ctx.body = { error: 'Tag with this name or slug already exists' }
        return
      }
    }

    const tag = await ctx.prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        slug: finalSlug,
        ...(color !== undefined && { color })
      }
    })

    ctx.body = {
      message: 'Tag updated successfully',
      tag
    }
  } catch (err) {
    console.error('Error updating tag:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update tag' }
  }
})

// Delete tag (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params

    const tag = await ctx.prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    if (!tag) {
      ctx.status = 404
      ctx.body = { error: 'Tag not found' }
      return
    }

    if (tag._count.posts > 0) {
      ctx.status = 400
      ctx.body = { error: 'Cannot delete tag with existing posts' }
      return
    }

    await ctx.prisma.tag.delete({
      where: { id: parseInt(id) }
    })

    ctx.body = { message: 'Tag deleted successfully' }
  } catch (err) {
    console.error('Error deleting tag:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to delete tag' }
  }
})

export default router
