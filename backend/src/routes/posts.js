import { Router } from 'express';
import { PostsService } from '../services/posts.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validatePost } from '../middleware/validation.js';

const router = Router();
const postsService = new PostsService();

// ============================================================================
// PUBLIC POSTS ENDPOINTS
// ============================================================================

// Get all published posts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const result = await postsService.findAll(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ============================================================================
// ADMIN POSTS ENDPOINTS
// ============================================================================

// Get all posts for admin (including drafts and archived)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = { ...req.query, status: 'all' };
    const result = await postsService.findAll(query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await postsService.findBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});


// Create new post
router.post('/', requireAuth, requireAdmin, validatePost, async (req, res) => {
  try {
    const post = await postsService.create(req.body, req.user.userId);
    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.message === 'Post with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
});

// Update post
router.put('/:id', requireAuth, requireAdmin, validatePost, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postsService.update(id, req.body);
    res.json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Post with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update post' });
    }
  }
});

// Update post status only
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const post = await postsService.update(id, { status: status.toUpperCase() });
    res.json({
      message: 'Post status updated successfully',
      post,
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update post status' });
    }
  }
});

// Delete post
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await postsService.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting post:', error);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }
});

// Bulk update post status
router.patch('/bulk-status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { postIds, status } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: 'Post IDs are required' });
    }

    if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const results = [];
    for (const id of postIds) {
      try {
        const post = await postsService.update(id, { status });
        results.push({ id, success: true, post });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      message: 'Bulk update completed',
      results,
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Failed to update posts' });
  }
});

// Bulk delete posts
router.delete('/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { postIds } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: 'Post IDs are required' });
    }

    const results = [];
    for (const id of postIds) {
      try {
        await postsService.delete(id);
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
    res.status(500).json({ error: 'Failed to delete posts' });
  }
});

export default router;
