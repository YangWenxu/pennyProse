import { Router } from 'express';
import { CategoriesService } from '../services/categories.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateCategory } from '../middleware/validation.js';

const router = Router();
const categoriesService = new CategoriesService();

// ============================================================================
// PUBLIC CATEGORIES ENDPOINTS
// ============================================================================

// Get all categories with post counts
router.get('/', async (req, res) => {
  try {
    const categories = await categoriesService.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ============================================================================
// ADMIN CATEGORIES ENDPOINTS
// ============================================================================

// Get all categories for admin (with detailed info)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const categories = await categoriesService.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by slug with posts
router.get('/:slug/posts', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await categoriesService.findBySlug(slug, parseInt(page), parseInt(limit));

    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching category posts:', error);
    res.status(500).json({ error: 'Failed to fetch category posts' });
  }
});


// Get single category by ID (admin)
router.get('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', requireAuth, requireAdmin, validateCategory, async (req, res) => {
  try {
    const category = await categoriesService.create(req.body);
    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.message === 'Category with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category
router.put('/:id', requireAuth, requireAdmin, validateCategory, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.update(id, req.body);
    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.message === 'Category not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Category with this slug already exists') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Delete category
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoriesService.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.message === 'Category not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Cannot delete category with existing posts') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
});

// Bulk delete categories
router.delete('/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ error: 'Category IDs are required' });
    }

    const results = [];
    for (const id of categoryIds) {
      try {
        await categoriesService.delete(id);
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
    res.status(500).json({ error: 'Failed to delete categories' });
  }
});

export default router;
