import { Router } from 'express';
import { CommentsService } from '../services/comments.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validateComment, validateCommentStatus } from '../middleware/validation.js';

const router = Router();
const commentsService = new CommentsService();

// ============================================================================
// PUBLIC COMMENTS ENDPOINTS
// ============================================================================

// Get comments for a post
router.get('/posts/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params;
    const comments = await commentsService.getPostComments(slug);
    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }
});

// Create new comment
router.post('/posts/:slug/comments', optionalAuth, validateComment, async (req, res) => {
  try {
    const { slug } = req.params;
    const comment = await commentsService.createComment(slug, req.body, req.user);
    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error.message === 'Post not found' || error.message === 'Invalid parent comment') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Update comment content (author only)
router.put('/:id', requireAuth, validateComment, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await commentsService.updateComment(id, content, req.user.userId);
    res.json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error.message === 'Comment not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'You can only edit your own comments') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// ============================================================================
// ADMIN COMMENTS ENDPOINTS
// ============================================================================

// Get all comments for admin
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await commentsService.getAllComments(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Update comment status
router.patch('/:id/status', requireAuth, requireAdmin, validateCommentStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const comment = await commentsService.updateCommentStatus(id, status.toUpperCase());
    res.json({
      message: 'Comment status updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    if (error.message === 'Comment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete comment (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await commentsService.deleteComment(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.message === 'Comment not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
});

// Get comment statistics
router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await commentsService.getCommentStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({ error: 'Failed to fetch comment statistics' });
  }
});

// Bulk update comment status
router.patch('/bulk-status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { commentIds, status } = req.body;
    
    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ error: 'Comment IDs are required' });
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const results = [];
    for (const id of commentIds) {
      try {
        const comment = await commentsService.updateCommentStatus(id, status.toUpperCase());
        results.push({ id, success: true, comment });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      message: 'Bulk status update completed',
      results,
    });
  } catch (error) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({ error: 'Failed to update comment status' });
  }
});

// Bulk delete comments
router.delete('/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { commentIds } = req.body;
    
    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ error: 'Comment IDs are required' });
    }

    const results = [];
    for (const id of commentIds) {
      try {
        await commentsService.deleteComment(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      message: 'Bulk delete completed',
      results,
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ error: 'Failed to delete comments' });
  }
});

export default router;
