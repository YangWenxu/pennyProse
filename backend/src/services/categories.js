import prisma from './database.js';

export class CategoriesService {
  // Helper function to generate slug
  generateSlug(name) {
    // For non-Latin characters, use a timestamp-based slug
    if (/[^\u0000-\u007F]/.test(name)) {
      const timestamp = Date.now().toString(36);
      return `category-${timestamp}`;
    }

    // For Latin characters, use standard slug
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }

  // Get all categories with post counts
  async findAll() {
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

    return categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
    }));
  }

  // Get category by slug with posts
  async findBySlug(slug, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // First find the category
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return null;
    }

    // Get posts for this category
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          categoryId: category.id,
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
          categoryId: category.id,
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
      category,
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Create new category (admin)
  async create(categoryData) {
    const { name, slug, description, color = '#3B82F6' } = categoryData;
    const finalSlug = slug || this.generateSlug(name);

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        color,
      },
    });

    return category;
  }

  // Update category (admin)
  async update(id, updateData) {
    const { name, slug, description, color } = updateData;

    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Generate slug if name changed
    const finalSlug = slug || (name ? this.generateSlug(name) : existingCategory.slug);

    // Check if slug conflicts with other categories
    if (finalSlug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: finalSlug },
      });

      if (slugConflict) {
        throw new Error('Category with this slug already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        slug: finalSlug,
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    });

    return category;
  }

  // Delete category (admin)
  async delete(id) {
    // Check if category has posts
    const postCount = await prisma.post.count({
      where: { categoryId: parseInt(id) },
    });

    if (postCount > 0) {
      throw new Error('Cannot delete category with existing posts');
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Category deleted successfully' };
  }

  // Get category by ID (admin)
  async findById(id) {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    return {
      ...category,
      postCount: category._count.posts,
    };
  }
}
