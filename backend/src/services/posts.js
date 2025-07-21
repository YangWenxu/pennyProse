import prisma from './database.js';

export class PostsService {
  // Helper function to generate slug
  generateSlug(title) {
    // For non-Latin characters, use a timestamp-based slug
    if (/[^\u0000-\u007F]/.test(title)) {
      const timestamp = Date.now().toString(36);
      return `post-${timestamp}`;
    }

    // For Latin characters, use standard slug
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  // Helper function to calculate read time
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Transform post data
  transformPost(post) {
    return {
      ...post,
      tags: post.tags ? post.tags.map((pt) => pt.tag) : [],
      commentCount: post._count ? post._count.comments : 0,
    };
  }

  // Get all posts with pagination and filtering
  async findAll(query = {}) {
    const { page = 1, limit = 10, search, category, tag, status = 'PUBLISHED', featured } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && status !== 'all' && { status: status.toUpperCase() }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { excerpt: { contains: search } },
          { content: { contains: search } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { tag: { slug: tag } } } }),
      ...(featured !== undefined && { featured: featured === 'true' }),
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

    return {
      posts: posts.map(post => this.transformPost(post)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Get single post by slug
  async findBySlug(slug) {
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
      return null;
    }

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.transformPost(post);
  }

  // Get single post by ID (for editing)
  async findById(id) {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
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

    if (!post) {
      return null;
    }

    return this.transformPost(post);
  }

  // Create new post (admin)
  async create(postData, authorId) {
    const { title, slug, excerpt, content, status = 'DRAFT', featured = false, categoryId, tagIds } = postData;

    // Generate slug if not provided
    const finalSlug = slug || this.generateSlug(title);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug },
    });

    if (existingPost) {
      throw new Error('Post with this slug already exists');
    }

    // Calculate read time
    const readTime = this.calculateReadTime(content);

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        status: status.toUpperCase(),
        featured,
        readTime,
        authorId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        publishedAt: status.toUpperCase() === 'PUBLISHED' ? new Date() : null,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            create: tagIds.map(tagId => ({ tagId: parseInt(tagId) })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.transformPost(post);
  }

  // Update post (admin)
  async update(id, updateData) {
    const { title, slug, excerpt, content, status, featured, categoryId, tagIds } = updateData;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Generate slug if title changed
    const finalSlug = slug || (title ? this.generateSlug(title) : existingPost.slug);

    // Check if slug conflicts with other posts
    if (finalSlug !== existingPost.slug) {
      const slugConflict = await prisma.post.findUnique({
        where: { slug: finalSlug },
      });

      if (slugConflict) {
        throw new Error('Post with this slug already exists');
      }
    }

    // Calculate read time if content changed
    const readTime = content ? this.calculateReadTime(content) : existingPost.readTime;

    // Update post
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        slug: finalSlug,
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content, readTime }),
        ...(status && {
          status: status.toUpperCase(),
          publishedAt:
            status.toUpperCase() === 'PUBLISHED' && existingPost.status !== 'PUBLISHED'
              ? new Date()
              : existingPost.publishedAt,
        }),
        ...(featured !== undefined && { featured }),
        ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map(tagId => ({ tagId: parseInt(tagId) })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.transformPost(post);
  }

  // Delete post (admin)
  async delete(id) {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Post deleted successfully' };
  }
}
