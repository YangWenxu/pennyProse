import Router from 'koa-router'
import Joi from 'joi'
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js'

const router = new Router({ prefix: '/api/posts' })

// Validation schemas
const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  slug: Joi.string().min(1).max(200),
  excerpt: Joi.string().max(500),
  content: Joi.string().required(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').default('DRAFT'),
  featured: Joi.boolean().default(false),
  categoryId: Joi.number().integer().positive(),
  tagIds: Joi.array().items(Joi.number().integer().positive())
})

const updatePostSchema = createPostSchema.fork(['title', 'content'], (schema) => schema.optional())

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Helper function to calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Get all posts (public)
router.get('/', optionalAuth, async (ctx) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'PUBLISHED',
      category,
      tag,
      search,
      featured
    } = ctx.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Build where clause
    const where = {
      ...(ctx.user?.role !== 'ADMIN' && { status: 'PUBLISHED' }),
      ...(status && ctx.user?.role === 'ADMIN' && { status }),
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { tag: { slug: tag } } } }),
      ...(featured !== undefined && { featured: featured === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [posts, total] = await Promise.all([
      ctx.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
        }
      }),
      ctx.prisma.post.count({ where })
    ])

    // Transform posts to include tags directly
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }))

    ctx.body = {
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch posts' }
  }
})

// Get single post by slug (public)
router.get('/:slug', optionalAuth, async (ctx) => {
  try {
    const { slug } = ctx.params

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
        },
        comments: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      ctx.status = 404
      ctx.body = { error: 'Post not found' }
      return
    }

    // Check if user can view this post
    if (post.status !== 'PUBLISHED' && ctx.user?.role !== 'ADMIN' && ctx.user?.id !== post.authorId) {
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
})

// Create post (admin only)
router.post('/', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { error, value } = createPostSchema.validate(ctx.request.body)

    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { title, slug, excerpt, content, status, featured, categoryId, tagIds } = value

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(title)

    // Check if slug already exists
    const existingPost = await ctx.prisma.post.findUnique({
      where: { slug: finalSlug }
    })

    if (existingPost) {
      ctx.status = 400
      ctx.body = { error: 'Post with this slug already exists' }
      return
    }

    // Calculate read time
    const readTime = calculateReadTime(content)

    // Create post
    const post = await ctx.prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        status,
        featured,
        readTime,
        authorId: ctx.user.id,
        categoryId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        ...(tagIds && {
          tags: {
            create: tagIds.map(tagId => ({ tagId }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    ctx.body = {
      message: 'Post created successfully',
      post: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }
    }
  } catch (err) {
    console.error('Error creating post:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to create post' }
  }
})

// Update post (admin only)
router.put('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params
    const { error, value } = updatePostSchema.validate(ctx.request.body)

    if (error) {
      ctx.status = 400
      ctx.body = { error: error.details[0].message }
      return
    }

    const { title, slug, excerpt, content, status, featured, categoryId, tagIds } = value

    // Check if post exists
    const existingPost = await ctx.prisma.post.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingPost) {
      ctx.status = 404
      ctx.body = { error: 'Post not found' }
      return
    }

    // Generate slug if title changed
    const finalSlug = slug || (title ? generateSlug(title) : existingPost.slug)

    // Check if slug conflicts with other posts
    if (finalSlug !== existingPost.slug) {
      const slugConflict = await ctx.prisma.post.findUnique({
        where: { slug: finalSlug }
      })

      if (slugConflict) {
        ctx.status = 400
        ctx.body = { error: 'Post with this slug already exists' }
        return
      }
    }

    // Calculate read time if content changed
    const readTime = content ? calculateReadTime(content) : existingPost.readTime

    // Update post
    const post = await ctx.prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        slug: finalSlug,
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content, readTime }),
        ...(status && {
          status,
          publishedAt: status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED'
            ? new Date()
            : existingPost.publishedAt
        }),
        ...(featured !== undefined && { featured }),
        ...(categoryId !== undefined && { categoryId }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tagId }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    ctx.body = {
      message: 'Post updated successfully',
      post: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }
    }
  } catch (err) {
    console.error('Error updating post:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to update post' }
  }
})

// Delete post (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (ctx) => {
  try {
    const { id } = ctx.params

    const post = await ctx.prisma.post.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      ctx.status = 404
      ctx.body = { error: 'Post not found' }
      return
    }

    await ctx.prisma.post.delete({
      where: { id: parseInt(id) }
    })

    ctx.body = { message: 'Post deleted successfully' }
  } catch (err) {
    console.error('Error deleting post:', err)
    ctx.status = 500
    ctx.body = { error: 'Failed to delete post' }
  }
})

export default router
