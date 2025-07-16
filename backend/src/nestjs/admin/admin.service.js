import { PrismaClient } from '@prisma/client';
import matter from 'gray-matter';

const prisma = new PrismaClient();

export class AdminService {
  // Helper function to generate slug
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Helper function to calculate read time
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Get admin dashboard statistics
  async getDashboardStats() {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments,
      pendingComments,
      totalCategories,
      totalTags,
      totalUsers,
      adminUsers,
      recentPosts,
      recentComments
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { status: 'ARCHIVED' } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, name: true }
          },
          category: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, name: true }
          },
          post: {
            select: { id: true, title: true, slug: true }
          }
        }
      })
    ]);

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        archived: archivedPosts
      },
      comments: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
        rejected: totalComments - approvedComments - pendingComments
      },
      categories: totalCategories,
      tags: totalTags,
      users: {
        total: totalUsers,
        admin: adminUsers,
        regular: totalUsers - adminUsers
      },
      recent: {
        posts: recentPosts,
        comments: recentComments
      }
    };
  }

  // Get all posts for admin management
  async getAllPosts(query = {}) {
    const { page = 1, limit = 10, status = 'all', search = '', authorId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status !== 'all' && { status: status.toUpperCase() }),
      ...(authorId && { authorId: parseInt(authorId) }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
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
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count({ where })
    ]);

    // Transform posts
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Create new post
  async createPost(postData, authorId) {
    const { title, slug, excerpt, content, status, featured, categoryId, tagIds } = postData;

    // Generate slug if not provided
    const finalSlug = slug || this.generateSlug(title);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug }
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
        status: status || 'DRAFT',
        featured: featured || false,
        readTime,
        authorId,
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
    });

    return {
      ...post,
      tags: post.tags.map(pt => pt.tag)
    };
  }

  // Update post
  async updatePost(postId, updateData) {
    const { title, slug, excerpt, content, status, featured, categoryId, tagIds } = updateData;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Generate slug if title changed
    const finalSlug = slug || (title ? this.generateSlug(title) : existingPost.slug);

    // Check if slug conflicts with other posts
    if (finalSlug !== existingPost.slug) {
      const slugConflict = await prisma.post.findUnique({
        where: { slug: finalSlug }
      });

      if (slugConflict) {
        throw new Error('Post with this slug already exists');
      }
    }

    // Calculate read time if content changed
    const readTime = content ? this.calculateReadTime(content) : existingPost.readTime;

    // Update post
    const post = await prisma.post.update({
      where: { id: postId },
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
    });

    return {
      ...post,
      tags: post.tags.map(pt => pt.tag)
    };
  }

  // Delete post
  async deletePost(postId) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
  }

  // Import markdown files
  async importMarkdownFiles(files, authorId) {
    const results = [];

    for (const file of files) {
      try {
        const content = file.buffer.toString('utf-8');
        const { data: frontMatter, content: markdownContent } = matter(content);

        const title = frontMatter.title || file.originalname.replace('.md', '');
        const slug = this.generateSlug(title);

        // Check if post already exists
        const existingPost = await prisma.post.findUnique({
          where: { slug }
        });

        if (existingPost) {
          results.push({
            file: file.originalname,
            status: 'skipped',
            reason: 'Post with this slug already exists'
          });
          continue;
        }

        const readTime = this.calculateReadTime(markdownContent);

        const post = await prisma.post.create({
          data: {
            title,
            slug,
            excerpt: frontMatter.excerpt || markdownContent.substring(0, 200) + '...',
            content: markdownContent,
            status: frontMatter.status || 'PUBLISHED',
            readTime,
            authorId,
            publishedAt: frontMatter.status === 'PUBLISHED' ? new Date() : null
          }
        });

        results.push({
          file: file.originalname,
          status: 'imported',
          postId: post.id,
          title: post.title
        });
      } catch (fileErr) {
        console.error(`Error processing file ${file.originalname}:`, fileErr);
        results.push({
          file: file.originalname,
          status: 'error',
          reason: fileErr.message
        });
      }
    }

    return {
      message: 'Import completed',
      results
    };
  }

  // Manage categories
  async createCategory(categoryData) {
    const { name, slug, description, color } = categoryData;
    const finalSlug = slug || this.generateSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        color: color || '#3B82F6'
      }
    });

    return category;
  }

  async updateCategory(categoryId, updateData) {
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    return category;
  }

  async deleteCategory(categoryId) {
    // Check if category has posts
    const postCount = await prisma.post.count({
      where: { categoryId }
    });

    if (postCount > 0) {
      throw new Error('Cannot delete category with existing posts');
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return { message: 'Category deleted successfully' };
  }

  // Manage tags
  async createTag(tagData) {
    const { name, slug, description, color } = tagData;
    const finalSlug = slug || this.generateSlug(name);

    const tag = await prisma.tag.create({
      data: {
        name,
        slug: finalSlug,
        description,
        color: color || '#10B981'
      }
    });

    return tag;
  }

  async updateTag(tagId, updateData) {
    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData
    });

    return tag;
  }

  async deleteTag(tagId) {
    // Check if tag has posts
    const postCount = await prisma.postTag.count({
      where: { tagId }
    });

    if (postCount > 0) {
      throw new Error('Cannot delete tag with existing posts');
    }

    await prisma.tag.delete({
      where: { id: tagId }
    });

    return { message: 'Tag deleted successfully' };
  }
}
