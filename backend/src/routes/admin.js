import { Router } from 'express';
import { AdminService } from '../services/admin.js';
import { PostsService } from '../services/posts.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateUserRole, validatePost } from '../middleware/validation.js';

const router = Router();
const adminService = new AdminService();
const postsService = new PostsService();

// ============================================================================
// ADMIN POSTS ENDPOINTS
// ============================================================================

// Get all posts for admin (including drafts and archived)
router.get('/posts', requireAuth, requireAdmin, async (req, res) => {
  try {
    // If no status is specified, show all posts; otherwise use the specified status
    const query = {
      ...req.query,
      status: req.query.status || 'all'
    };
    const result = await postsService.findAll(query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ============================================================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================================================

// Get dashboard statistics
router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get admin stats (alias for dashboard)
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get system overview
router.get('/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const overview = await adminService.getSystemOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching system overview:', error);
    res.status(500).json({ error: 'Failed to fetch system overview' });
  }
});

// Get content analytics
router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const analytics = await adminService.getContentAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Failed to fetch content analytics' });
  }
});

// ============================================================================
// ARCHIVE ENDPOINTS
// ============================================================================

// Get posts archive (grouped by year and month)
router.get('/archive', async (req, res) => {
  try {
    const archive = await adminService.getPostsArchive();
    res.json({ archive });
  } catch (error) {
    console.error('Error fetching posts archive:', error);
    res.status(500).json({ error: 'Failed to fetch posts archive' });
  }
});

// Get posts by specific year and month
router.get('/archive/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const result = await adminService.getPostsByYearMonth(yearNum, monthNum, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Error fetching posts by year/month:', error);
    res.status(500).json({ error: 'Failed to fetch posts by year/month' });
  }
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

// Get all users for management
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await adminService.getUserManagement(req.query);
    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:id/role', requireAuth, requireAdmin, validateUserRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await adminService.updateUserRole(id, role.toUpperCase());
    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Invalid role') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
});

// Delete user
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Cannot delete user with existing posts or comments') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
});

// Bulk update user roles
router.patch('/users/bulk-role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userIds, role } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    if (!['USER', 'ADMIN'].includes(role?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const results = [];
    for (const id of userIds) {
      try {
        const user = await adminService.updateUserRole(id, role.toUpperCase());
        results.push({ id, success: true, user });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      message: 'Bulk role update completed',
      results,
    });
  } catch (error) {
    console.error('Error in bulk role update:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});

// Bulk delete users
router.delete('/users/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    const results = [];
    for (const id of userIds) {
      try {
        await adminService.deleteUser(id);
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
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// ============================================================================
// SYSTEM MAINTENANCE ENDPOINTS
// ============================================================================

// Get system health
router.get('/health', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Basic system health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };

    res.json(health);
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ error: 'Failed to check system health' });
  }
});

// Clear cache (placeholder for future implementation)
router.post('/cache/clear', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Placeholder for cache clearing logic
    res.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Export data (placeholder for future implementation)
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    // Placeholder for data export logic
    res.json({
      message: 'Data export initiated',
      type,
      timestamp: new Date().toISOString(),
      note: 'This feature will be implemented in a future version',
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
