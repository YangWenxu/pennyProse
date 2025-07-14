import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'

// Load environment variables
dotenv.config()

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Express app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.static('public'))

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true)
    } else {
      cb(new Error('Only Markdown files are allowed'), false)
    }
  }
})

// Add Prisma to request object
app.use((req, res, next) => {
  req.prisma = prisma
  next()
})

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested')
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'pennyprose-backend'
  })
})

// ==================== BLOG POSTS ENDPOINTS ====================

// Get all posts with pagination and filtering
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, category, tag } = req.query

    console.log('Fetching posts with params:', { page, limit, status, search, category, tag })

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Build where clause
    const where = {}

    // Status filter (for admin)
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    } else {
      where.status = 'PUBLISHED' // Default to published for public
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      ]
    }

    // Category filter
    if (category) {
      const categoryRecord = await req.prisma.category.findFirst({
        where: { slug: category }
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      }
    }

    // Tag filter
    if (tag) {
      const tagRecord = await req.prisma.tag.findFirst({
        where: { slug: tag }
      })
      if (tagRecord) {
        where.tags = {
          some: {
            tagId: tagRecord.id
          }
        }
      }
    }

    const [posts, total] = await Promise.all([
      req.prisma.post.findMany({
        where,
        skip,
        take,
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
      }),
      req.prisma.post.count({ where })
    ])

    // Transform posts to include tags directly
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }))

    res.json({
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('Error fetching posts:', err)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// Get single post by slug
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    console.log('Fetching post with slug:', slug)

    const post = await req.prisma.post.findUnique({
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
      return res.status(404).json({ error: 'Post not found' })
    }

    // Increment view count
    await req.prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    // Transform post
    const transformedPost = {
      ...post,
      tags: post.tags.map(pt => pt.tag)
    }

    res.json({ post: transformedPost })
  } catch (err) {
    console.error('Error fetching post:', err)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

// Simple test endpoint
app.post('/api/test', async (req, res) => {
  console.log('Test endpoint called')
  res.json({ message: 'Test successful', body: req.body })
})

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, excerpt, categoryId, tagIds } = req.body
    console.log('Creating new post:', title)
    console.log('Request body:', { title, content: content?.substring(0, 100), excerpt, categoryId, tagIds })

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '') // Allow Chinese characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // If slug is empty (e.g., all Chinese characters), use timestamp
    if (!slug) {
      slug = `post-${Date.now()}`
    }

    console.log('Generated slug:', slug)

    // Check if slug already exists
    console.log('Checking for existing post...')
    const existingPost = await req.prisma.post.findUnique({
      where: { slug }
    })
    console.log('Existing post check complete:', !!existingPost)

    if (existingPost) {
      return res.status(400).json({ error: 'Post with this slug already exists' })
    }

    // Calculate read time
    const readTime = Math.ceil(content.split(' ').length / 200)
    console.log('Calculated read time:', readTime)

    // For now, use the first user as author (in real app, get from auth)
    console.log('Finding first user...')
    const firstUser = await req.prisma.user.findFirst()
    console.log('First user found:', !!firstUser)
    if (!firstUser) {
      return res.status(400).json({ error: 'No users found' })
    }

    // Create post
    console.log('Creating post with data:', {
      title,
      slug,
      excerpt,
      content: content?.substring(0, 50) + '...',
      status: 'PUBLISHED',
      readTime,
      authorId: firstUser.id,
      categoryId: categoryId || null,
      tagIds
    })

    // Create post without tags first to avoid potential issues
    const postData = {
      title,
      slug,
      excerpt,
      content,
      status: 'PUBLISHED',
      readTime,
      authorId: firstUser.id,
      categoryId: categoryId ? parseInt(categoryId) : null,
      publishedAt: new Date()
    }

    const post = await req.prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        category: true
      }
    })

    console.log('Post created successfully:', post.id)

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      console.log('Adding tags to post...')
      await req.prisma.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: post.id,
          tagId: parseInt(tagId)
        }))
      })
      console.log('Tags added successfully')
    }

    // Return the created post
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...post,
        tags: [] // Tags will be empty for now, can be fetched separately if needed
      }
    })
  } catch (err) {
    console.error('Error creating post:', err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params

    console.log('Deleting post:', id)

    // Check if post exists
    const post = await req.prisma.post.findUnique({
      where: { id: parseInt(id) }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Delete related records first
    await req.prisma.postTag.deleteMany({
      where: { postId: parseInt(id) }
    })

    await req.prisma.comment.deleteMany({
      where: { postId: parseInt(id) }
    })

    // Delete the post
    await req.prisma.post.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Post deleted successfully' })
  } catch (err) {
    console.error('Error deleting post:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// Update post status
app.patch('/api/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    console.log('Updating post status:', id, status)

    if (!['PUBLISHED', 'DRAFT', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const post = await req.prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
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

    res.json({
      message: 'Post status updated successfully',
      post: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }
    })
  } catch (err) {
    console.error('Error updating post status:', err)
    res.status(500).json({ error: 'Failed to update post status' })
  }
})

// ==================== CATEGORIES ENDPOINTS ====================

// Get categories with post counts
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await req.prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' }
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

    res.json({ categories: transformedCategories })
  } catch (err) {
    console.error('Error fetching categories:', err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, color } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if category already exists
    const existingCategory = await req.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }]
      }
    })

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' })
    }

    const category = await req.prisma.category.create({
      data: {
        name,
        slug,
        description,
        color: color || '#3B82F6'
      }
    })

    res.status(201).json({
      message: 'Category created successfully',
      category
    })
  } catch (err) {
    console.error('Error creating category:', err)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Get posts by category
app.get('/api/categories/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const category = await req.prisma.category.findUnique({
      where: { slug }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const [posts, total] = await Promise.all([
      req.prisma.post.findMany({
        where: {
          categoryId: category.id,
          status: 'PUBLISHED'
        },
        skip,
        take,
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
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      req.prisma.post.count({
        where: {
          categoryId: category.id,
          status: 'PUBLISHED'
        }
      })
    ])

    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }))

    res.json({
      category,
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('Error fetching category posts:', err)
    res.status(500).json({ error: 'Failed to fetch category posts' })
  }
})

// ==================== TAGS ENDPOINTS ====================

// Get tags with post counts
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await req.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: { status: 'PUBLISHED' }
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

    res.json({ tags: transformedTags })
  } catch (err) {
    console.error('Error fetching tags:', err)
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
})

// Create tag
app.post('/api/tags', async (req, res) => {
  try {
    const { name, color } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if tag already exists
    const existingTag = await req.prisma.tag.findFirst({
      where: {
        OR: [{ name }, { slug }]
      }
    })

    if (existingTag) {
      return res.status(400).json({ error: 'Tag with this name already exists' })
    }

    const tag = await req.prisma.tag.create({
      data: {
        name,
        slug,
        color: color || '#8B5CF6'
      }
    })

    res.status(201).json({
      message: 'Tag created successfully',
      tag
    })
  } catch (err) {
    console.error('Error creating tag:', err)
    res.status(500).json({ error: 'Failed to create tag' })
  }
})

// Get posts by tag
app.get('/api/tags/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params
    const { page = 1, limit = 10 } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    const tag = await req.prisma.tag.findUnique({
      where: { slug }
    })

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    const [postTags, total] = await Promise.all([
      req.prisma.postTag.findMany({
        where: {
          tagId: tag.id,
          post: { status: 'PUBLISHED' }
        },
        skip,
        take,
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
              category: true,
              tags: {
                include: {
                  tag: true
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
        orderBy: { post: { createdAt: 'desc' } }
      }),
      req.prisma.postTag.count({
        where: {
          tagId: tag.id,
          post: { status: 'PUBLISHED' }
        }
      })
    ])

    const transformedPosts = postTags.map(pt => ({
      ...pt.post,
      tags: pt.post.tags.map(t => t.tag),
      commentCount: pt.post._count.comments
    }))

    res.json({
      tag,
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('Error fetching tag posts:', err)
    res.status(500).json({ error: 'Failed to fetch tag posts' })
  }
})

// ==================== ADMIN ENDPOINTS ====================

// Get admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('Fetching admin stats...')

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalTags,
      totalComments,
      recentPosts
    ] = await Promise.all([
      req.prisma.post.count(),
      req.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      req.prisma.post.count({ where: { status: 'DRAFT' } }),
      req.prisma.category.count(),
      req.prisma.tag.count(),
      req.prisma.comment.count(),
      req.prisma.post.findMany({
        take: 5,
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
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalTags,
      totalComments,
      recentPosts: recentPosts.map(post => ({
        ...post,
        commentCount: post._count.comments
      }))
    }

    res.json({ stats })
  } catch (err) {
    console.error('Error fetching admin stats:', err)
    res.status(500).json({ error: 'Failed to fetch admin stats' })
  }
})

// Get all posts for admin (including drafts)
app.get('/api/admin/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query

    console.log('Fetching admin posts...', { page, limit, status, search })

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Build where clause
    const where = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      ]
    }

    const [posts, total] = await Promise.all([
      req.prisma.post.findMany({
        where,
        skip,
        take,
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
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      req.prisma.post.count({ where })
    ])

    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }))

    res.json({
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('Error fetching admin posts:', err)
    res.status(500).json({ error: 'Failed to fetch admin posts' })
  }
})

// Import markdown files
app.post('/api/admin/import-markdown', upload.array('markdownFiles', 10), async (req, res) => {
  try {
    console.log('Importing markdown files...')

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const results = []
    const errors = []

    // Get the first user as author
    const firstUser = await req.prisma.user.findFirst()
    if (!firstUser) {
      return res.status(400).json({ error: 'No users found in the system' })
    }

    for (const file of req.files) {
      try {
        console.log('Processing file:', file.originalname)

        // Parse markdown with frontmatter
        const fileContent = file.buffer.toString('utf-8')
        const parsed = matter(fileContent)

        // Extract metadata from frontmatter
        const frontmatter = parsed.data
        const content = parsed.content

        // Generate title from frontmatter or filename
        const title = frontmatter.title ||
                     file.originalname.replace(/\.md$/, '').replace(/[-_]/g, ' ')

        // Generate slug
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')

        // Check if post with this slug already exists
        const existingPost = await req.prisma.post.findUnique({
          where: { slug }
        })

        if (existingPost) {
          errors.push({
            file: file.originalname,
            error: `Post with slug "${slug}" already exists`
          })
          continue
        }

        // Calculate read time
        const wordCount = content.split(/\s+/).length
        const readTime = Math.max(1, Math.ceil(wordCount / 200))

        // Find category by name if specified
        let categoryId = null
        if (frontmatter.category) {
          const category = await req.prisma.category.findFirst({
            where: {
              OR: [
                { name: frontmatter.category },
                { slug: frontmatter.category.toLowerCase() }
              ]
            }
          })
          categoryId = category?.id || null
        }

        // Find or create tags
        let tagIds = []
        if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
          for (const tagName of frontmatter.tags) {
            let tag = await req.prisma.tag.findFirst({
              where: {
                OR: [
                  { name: tagName },
                  { slug: tagName.toLowerCase().replace(/\s+/g, '-') }
                ]
              }
            })

            if (!tag) {
              // Create new tag
              tag = await req.prisma.tag.create({
                data: {
                  name: tagName,
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  color: '#8B5CF6' // Default purple color
                }
              })
            }

            tagIds.push(tag.id)
          }
        }

        // Determine status
        const status = frontmatter.published === false ? 'DRAFT' : 'PUBLISHED'

        // Create the post
        const post = await req.prisma.post.create({
          data: {
            title,
            slug,
            excerpt: frontmatter.excerpt || frontmatter.description || content.substring(0, 200) + '...',
            content,
            status,
            readTime,
            authorId: firstUser.id,
            categoryId,
            publishedAt: status === 'PUBLISHED' ? new Date(frontmatter.date || Date.now()) : null,
            featured: frontmatter.featured || false
          }
        })

        // Add tags if any
        if (tagIds.length > 0) {
          await req.prisma.postTag.createMany({
            data: tagIds.map(tagId => ({
              postId: post.id,
              tagId
            }))
          })
        }

        results.push({
          file: file.originalname,
          postId: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status
        })

        console.log('Successfully imported:', file.originalname, '-> Post ID:', post.id)

      } catch (fileError) {
        console.error('Error processing file:', file.originalname, fileError)
        errors.push({
          file: file.originalname,
          error: fileError.message
        })
      }
    }

    res.json({
      message: `Imported ${results.length} files successfully`,
      results,
      errors,
      summary: {
        total: req.files.length,
        successful: results.length,
        failed: errors.length
      }
    })

  } catch (err) {
    console.error('Error importing markdown files:', err)
    res.status(500).json({ error: 'Failed to import markdown files' })
  }
})

// ==================== COMMENTS ENDPOINTS ====================

// Get comments for a post
app.get('/api/posts/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params

    console.log('Fetching comments for post:', slug)

    // First find the post
    const post = await req.prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Get comments with nested replies
    const comments = await req.prisma.comment.findMany({
      where: {
        postId: post.id,
        parentId: null, // Only top-level comments
        status: 'APPROVED'
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
        replies: {
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
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: {
              where: { status: 'APPROVED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform comments to handle anonymous authors
    const transformedComments = comments.map(comment => ({
      ...comment,
      author: comment.author || {
        id: null,
        username: null,
        name: 'Anonymous',
        avatar: null
      },
      replies: comment.replies.map(reply => ({
        ...reply,
        author: reply.author || {
          id: null,
          username: null,
          name: 'Anonymous',
          avatar: null
        }
      }))
    }))

    res.json({ comments: transformedComments })
  } catch (err) {
    console.error('Error fetching comments:', err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Create a new comment
app.post('/api/posts/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params
    const { content, authorName, authorEmail, parentId } = req.body

    console.log('Creating comment for post:', slug)

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    if (!authorName || !authorName.trim()) {
      return res.status(400).json({ error: 'Author name is required' })
    }

    // Find the post
    const post = await req.prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await req.prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        select: { id: true, postId: true }
      })

      if (!parentComment || parentComment.postId !== post.id) {
        return res.status(400).json({ error: 'Invalid parent comment' })
      }
    }

    // For now, create comments without user authentication
    // In a real app, you'd want proper user authentication
    const comment = await req.prisma.comment.create({
      data: {
        content: content.trim(),
        postId: post.id,
        parentId: parentId ? parseInt(parentId) : null,
        status: 'APPROVED', // Auto-approve for demo purposes
        authorId: null // No user authentication for now
      },
      include: {
        _count: {
          select: {
            replies: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    })

    // Add guest author info to response
    const responseComment = {
      ...comment,
      author: {
        id: null,
        username: null,
        name: authorName,
        avatar: null,
        email: authorEmail
      }
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment: responseComment
    })
  } catch (err) {
    console.error('Error creating comment:', err)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// ==================== ARCHIVE ENDPOINTS ====================

// Get archive data (years and months with post counts)
app.get('/api/archive', async (req, res) => {
  try {
    console.log('Fetching archive data...')

    // Get all published posts with their dates
    const posts = await req.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        publishedAt: true,
        createdAt: true
      },
      orderBy: { publishedAt: 'desc' }
    })

    // Group posts by year and month
    const archive = {}

    posts.forEach(post => {
      const date = new Date(post.publishedAt || post.createdAt)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // JavaScript months are 0-indexed
      const monthName = date.toLocaleDateString('en-US', { month: 'long' })

      if (!archive[year]) {
        archive[year] = {}
      }

      if (!archive[year][month]) {
        archive[year][month] = {
          name: monthName,
          count: 0
        }
      }

      archive[year][month].count++
    })

    // Convert to array format
    const archiveArray = Object.keys(archive)
      .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years descending
      .map(year => ({
        year: parseInt(year),
        months: Object.keys(archive[year])
          .sort((a, b) => parseInt(b) - parseInt(a)) // Sort months descending
          .map(month => ({
            month: parseInt(month),
            name: archive[year][month].name,
            count: archive[year][month].count
          }))
      }))

    res.json({ archive: archiveArray })
  } catch (err) {
    console.error('Error fetching archive:', err)
    res.status(500).json({ error: 'Failed to fetch archive' })
  }
})

// Get posts by year and month
app.get('/api/archive/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params
    const { page = 1, limit = 10 } = req.query

    console.log(`Fetching posts for ${year}-${month}`)

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Create date range for the specified month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)

    const [posts, total] = await Promise.all([
      req.prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            {
              publishedAt: {
                gte: startDate,
                lte: endDate
              }
            },
            {
              publishedAt: null,
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          ]
        },
        skip,
        take,
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
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      req.prisma.post.count({
        where: {
          status: 'PUBLISHED',
          OR: [
            {
              publishedAt: {
                gte: startDate,
                lte: endDate
              }
            },
            {
              publishedAt: null,
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          ]
        }
      })
    ])

    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }))

    const monthName = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      monthName,
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    console.error('Error fetching archive posts:', err)
    res.status(500).json({ error: 'Failed to fetch archive posts' })
  }
})

// ==================== ERROR HANDLERS AND SERVER SETUP ====================

// 404 handler
app.use((req, res) => {
  console.log('404 for path:', req.path)
  res.status(404).json({ error: 'Not Found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
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
  console.log(`🚀 PennyProse Backend Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: SQLite with Prisma`)
  console.log(`🔧 Features: Blog Posts, Categories, Tags, Comments, Archive, Admin`)
  console.log(`📁 File Upload: Markdown import supported`)
})

export default app
