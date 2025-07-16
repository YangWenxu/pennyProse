import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
              },
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

  async findBySlug(slug, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // First find the category
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return null;
    }

    // Get posts for this category
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
      this.prisma.post.count({
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
}
