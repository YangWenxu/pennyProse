// Simplified NestJS-style server with basic auth and comments
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Simple auth middleware (without JWT for now)
const requireAuth = (req, res, next) => {
  // For testing, we'll simulate an authenticated user
  req.user = { userId: 1, username: 'admin', role: 'ADMIN' };
  next();
};

const optionalAuth = (req, res, next) => {
  // For testing, we'll simulate an optional authenticated user
  req.user = null; // or { userId: 1, username: 'admin', role: 'ADMIN' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'pennyprose-backend-nestjs-simple',
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test successful',
    framework: 'NestJS-style with Express (Simple)',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// AUTHENTICATION ENDPOINTS (Simplified)
// ============================================================================

// Simple login (for testing)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For simplicity, we'll skip password verification
    res.json({
      message: 'Login successful',
      user,
      token: 'simple-token-for-testing'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
app.get('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============================================================================
// COMMENTS ENDPOINTS
// ============================================================================

// Get comments for a post
app.get('/api/posts/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching comments for post:', slug);

    // First find the post
    const post = await prisma.post.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments with nested replies
    const comments = await prisma.comment.findMany({
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
          where: {
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
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform comments to include anonymous author if no author
    const transformedComments = comments.map(comment => ({
      ...comment,
      author: comment.author || {
        id: null,
        username: null,
        name: comment.authorName || 'Anonymous',
        avatar: null
      },
      replies: comment.replies.map(reply => ({
        ...reply,
        author: reply.author || {
          id: null,
          username: null,
          name: reply.authorName || 'Anonymous',
          avatar: null
        }
      }))
    }));

    res.json({ comments: transformedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create new comment
app.post('/api/posts/:slug/comments', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { content, authorName, authorEmail, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    console.log('Creating comment for post:', slug);

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        parentId: parentId || null,
        status: 'APPROVED', // Auto-approve for now
        authorId: req.user?.userId || null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Transform comment to include anonymous author
    const transformedComment = {
      ...comment,
      author: comment.author || {
        id: null,
        username: null,
        name: authorName || 'Anonymous',
        avatar: null
      }
    };

    res.status(201).json({
      message: 'Comment created successfully',
      comment: transformedComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// ============================================================================
// EXISTING ENDPOINTS (Posts, Categories, Tags)
// ============================================================================

// Posts endpoints (existing code)
app.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, tag } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'PUBLISHED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { tag: { slug: tag } } } }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const transformedPosts = posts.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag),
      commentCount: post._count.comments,
    }));

    res.json({
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by slug (existing code)
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    const transformedPost = {
      ...post,
      tags: post.tags.map((pt) => pt.tag),
    };

    res.json({ post: transformedPost });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Categories endpoints (existing code)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const transformedCategories = categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
    }));

    res.json({ categories: transformedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Tags endpoints (existing code)
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: { status: 'PUBLISHED' },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const transformedTags = tags.map((tag) => ({
      ...tag,
      postCount: tag._count.posts,
    }));

    res.json({ tags: transformedTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 PennyProse Backend Server (NestJS-Simple) running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: SQLite with Prisma`);
  console.log(`🔧 Framework: Express (NestJS-style)`);
  console.log(`📁 Features: Blog Posts, Categories, Tags, Comments, Basic Auth`);
  console.log(`🔐 Authentication: Simplified (for testing)`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
