import prisma from './database.js';

export class TagsService {
  // Helper function to generate slug
  generateSlug(name) {
    // For non-Latin characters, use a timestamp-based slug
    if (/[^\u0000-\u007F]/.test(name)) {
      const timestamp = Date.now().toString(36);
      return `tag-${timestamp}`;
    }

    // For Latin characters, use standard slug
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  // Get all tags with post counts
  async findAll() {
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

    return tags.map((tag) => ({
      ...tag,
      postCount: tag._count.posts,
    }));
  }

  // Get tag by slug with posts
  async findBySlug(slug, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // First find the tag
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return null;
    }

    // Get posts for this tag
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          tags: {
            some: {
              tagId: tag.id,
            },
          },
          status: 'PUBLISHED',
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
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          tags: {
            some: {
              tagId: tag.id,
            },
          },
          status: 'PUBLISHED',
        },
      }),
    ]);

    // Transform posts
    const transformedPosts = posts.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag),
      commentCount: post._count.comments,
    }));

    return {
      tag,
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Create new tag (admin)
  async create(tagData) {
    const { name, slug, color = '#10B981' } = tagData;
    const finalSlug = (slug && slug.trim()) || this.generateSlug(name);

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug: finalSlug },
    });

    if (existingTag) {
      throw new Error('Tag with this slug already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: finalSlug,
        color,
      },
    });

    return tag;
  }

  // Update tag (admin)
  async update(id, updateData) {
    const { name, slug, color } = updateData;

    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTag) {
      throw new Error('Tag not found');
    }

    // Generate slug if name changed
    const finalSlug = slug || (name ? this.generateSlug(name) : existingTag.slug);

    // Check if slug conflicts with other tags
    if (finalSlug !== existingTag.slug) {
      const slugConflict = await prisma.tag.findUnique({
        where: { slug: finalSlug },
      });

      if (slugConflict) {
        throw new Error('Tag with this slug already exists');
      }
    }

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        slug: finalSlug,
        ...(color && { color }),
      },
    });

    return tag;
  }

  // Delete tag (admin)
  async delete(id) {
    // Check if tag has posts
    const postCount = await prisma.postTag.count({
      where: { tagId: parseInt(id) },
    });

    if (postCount > 0) {
      throw new Error('Cannot delete tag with existing posts');
    }

    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Tag deleted successfully' };
  }

  // Get tag by ID (admin)
  async findById(id) {
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!tag) {
      return null;
    }

    return {
      ...tag,
      postCount: tag._count.posts,
    };
  }
}
