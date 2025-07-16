import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommentsService {
  // Get comments for a post
  async getPostComments(postSlug) {
    // First find the post
    const post = await prisma.post.findUnique({
      where: { slug: postSlug }
    });

    if (!post) {
      throw new Error('Post not found');
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

    return transformedComments;
  }

  // Create new comment
  async createComment(postSlug, commentData, user = null) {
    const { content, authorName, authorEmail, parentId } = commentData;

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug: postSlug }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment || parentComment.postId !== post.id) {
        throw new Error('Invalid parent comment');
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        parentId: parentId || null,
        status: 'APPROVED', // Auto-approve for now
        authorId: user?.userId || null,
        // For anonymous comments, store name and email
        ...((!user && authorName) && { authorName }),
        ...((!user && authorEmail) && { authorEmail })
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

    return transformedComment;
  }

  // Get all comments for admin
  async getAllComments(query = {}) {
    const { page = 1, limit = 20, status = 'all', postId } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status !== 'all' && { status: status.toUpperCase() }),
      ...(postId && { postId: parseInt(postId) })
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
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
          post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          parent: {
            select: {
              id: true,
              content: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where })
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update comment status
  async updateCommentStatus(commentId, status) {
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid status');
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return comment;
  }

  // Delete comment
  async deleteComment(commentId) {
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: true
      }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Delete comment and all its replies
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId }
        ]
      }
    });

    return { message: 'Comment deleted successfully' };
  }

  // Update comment content (author only)
  async updateComment(commentId, content, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user is the author
    if (comment.authorId !== userId) {
      throw new Error('You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { 
        content,
        updatedAt: new Date()
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

    return updatedComment;
  }

  // Get comment statistics
  async getCommentStats() {
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'APPROVED' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'REJECTED' } })
    ]);

    return {
      total,
      approved,
      pending,
      rejected
    };
  }
}
