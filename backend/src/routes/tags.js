import { Router } from 'express';
import { TagsService } from '../services/tags.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateTag } from '../middleware/validation.js';

const router = Router();
const tagsService = new TagsService();

// ============================================================================
// PUBLIC TAGS ENDPOINTS
// ============================================================================

// Get all tags with post counts
router.get('/', async (req, res) => {
  try {
    const tags = await tagsService.findAll();
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// ============================================================================
// ADMIN TAGS ENDPOINTS
// ============================================================================

// Get all tags for admin (with detailed info)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tags = await tagsService.findAll();
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching admin tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get tag by slug with posts
router.get('/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await tagsService.findBySlug(slug, parseInt(page), parseInt(limit));

    if (!result) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching tag posts:', error);
    res.status(500).json({ error: 'Failed to fetch tag posts' });
  }
});


// Get single tag by ID (admin)
router.get('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await tagsService.findById(id);
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ tag });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Create new tag
router.post('/', requireAuth, requireAdmin, validateTag, async (req, res) => {
  try {
    const tag = await tagsService.create(req.body);
    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error.message === 'Tag with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }
});

// Update tag
router.put('/:id', requireAuth, requireAdmin, validateTag, async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await tagsService.update(id, req.body);
    res.json({
      success: true,
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error.message === 'Tag not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Tag with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update tag' });
    }
  }
});

// Delete tag
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tagsService.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting tag:', error);
    if (error.message === 'Tag not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Cannot delete tag with existing posts') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  }
});

// Bulk delete tags
router.delete('/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { tagIds } = req.body;
    
    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ error: 'Tag IDs are required' });
    }

    const results = [];
    for (const id of tagIds) {
      try {
        await tagsService.delete(id);
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
    res.status(500).json({ error: 'Failed to delete tags' });
  }
});

export default router;
