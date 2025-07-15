import prisma from './database.js';

export class AdminService {
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
      rejectedComments,
      totalCategories,
      totalTags,
      totalUsers,
      adminUsers,
      recentPosts,
      recentComments,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.post.count({ where: { status: 'DRAFT' } }),
      prisma.post.count({ where: { status: 'ARCHIVED' } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'REJECTED' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, name: true },
          },
          category: {
            select: { id: true, name: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, name: true },
          },
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
    ]);

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        archived: archivedPosts,
      },
      comments: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
        rejected: rejectedComments,
      },
      categories: totalCategories,
      tags: totalTags,
      users: {
        total: totalUsers,
        admin: adminUsers,
        regular: totalUsers - adminUsers,
      },
      recent: {
        posts: recentPosts.map(post => ({
          ...post,
          commentCount: post._count.comments,
        })),
        comments: recentComments,
      },
    };
  }

  // Get system overview
  async getSystemOverview() {
    const [
      totalViews,
      totalPosts,
      totalComments,
      totalUsers,
      popularPosts,
      activeUsers,
    ] = await Promise.all([
      prisma.post.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.user.count(),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalViews: totalViews._sum.viewCount || 0,
        totalPosts,
        totalComments,
        totalUsers,
      },
      popularPosts,
      activeUsers: activeUsers.map(user => ({
        ...user,
        postCount: user._count.posts,
        commentCount: user._count.comments,
      })),
    };
  }

  // Get content analytics
  async getContentAnalytics() {
    const [
      postsByCategory,
      postsByTag,
      postsByMonth,
      commentsByMonth,
    ] = await Promise.all([
      prisma.category.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: { status: 'PUBLISHED' },
              },
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      prisma.tag.findMany({
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
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      this.getPostsByMonth(),
      this.getCommentsByMonth(),
    ]);

    return {
      postsByCategory: postsByCategory.map(cat => ({
        name: cat.name,
        count: cat._count.posts,
        color: cat.color,
      })),
      postsByTag: postsByTag.map(tag => ({
        name: tag.name,
        count: tag._count.posts,
        color: tag.color,
      })),
      postsByMonth,
      commentsByMonth,
    };
  }

  // Helper method to get posts by month (last 12 months)
  async getPostsByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = {};
    posts.forEach(post => {
      const monthKey = post.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Fill in missing months with 0
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      result.push({
        month: monthKey,
        count: monthlyData[monthKey] || 0,
      });
    }

    return result;
  }

  // Helper method to get comments by month (last 12 months)
  async getCommentsByMonth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const comments = await prisma.comment.findMany({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData = {};
    comments.forEach(comment => {
      const monthKey = comment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Fill in missing months with 0
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      result.push({
        month: monthKey,
        count: monthlyData[monthKey] || 0,
      });
    }

    return result;
  }

  // Get user management data
  async getUserManagement(query = {}) {
    const { page = 1, limit = 20, search, role } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } },
          { name: { contains: search } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => ({
        ...user,
        postCount: user._count.posts,
        commentCount: user._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update user role
  async updateUserRole(userId, role) {
    if (!['USER', 'ADMIN'].includes(role)) {
      throw new Error('Invalid role');
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  // Delete user
  async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has content
    if (user._count.posts > 0 || user._count.comments > 0) {
      throw new Error('Cannot delete user with existing posts or comments');
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    return { message: 'User deleted successfully' };
  }

  // Get posts archive by year and month
  async getPostsArchive() {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Group posts by year and month
    const archive = {};
    posts.forEach(post => {
      const date = post.publishedAt || post.createdAt;
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      if (!archive[year]) {
        archive[year] = {};
      }

      if (!archive[year][monthKey]) {
        archive[year][monthKey] = {
          year,
          month,
          monthName: date.toLocaleString('default', { month: 'long' }),
          posts: [],
          count: 0,
        };
      }

      archive[year][monthKey].posts.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt || post.createdAt,
      });
      archive[year][monthKey].count++;
    });

    // Convert to array format
    const archiveArray = [];
    Object.keys(archive).sort((a, b) => b - a).forEach(year => {
      const yearData = {
        year: parseInt(year),
        months: [],
        totalPosts: 0,
      };

      Object.keys(archive[year]).sort((a, b) => b.localeCompare(a)).forEach(monthKey => {
        yearData.months.push(archive[year][monthKey]);
        yearData.totalPosts += archive[year][monthKey].count;
      });

      archiveArray.push(yearData);
    });

    return archiveArray;
  }

  // Get posts by specific year and month
  async getPostsByYearMonth(year, month, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Create date range for the specified month
    const startDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
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
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    // Transform posts
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(pt => pt.tag),
      commentCount: post._count.comments,
    }));

    return {
      year: parseInt(year),
      month: parseInt(month),
      monthName: startDate.toLocaleString('default', { month: 'long' }),
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
