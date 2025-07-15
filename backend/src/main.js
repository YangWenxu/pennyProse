// PennyProse Backend - Modular NestJS Style with Express
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import postsRoutes from './routes/posts.js';
import categoriesRoutes from './routes/categories.js';
import tagsRoutes from './routes/tags.js';
import commentsRoutes from './routes/comments.js';
import adminRoutes from './routes/admin.js';

// Import services for direct use
import { AdminService } from './services/admin.js';

// Initialize services for direct use
const adminService = new AdminService();

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));

// ============================================================================
// HEALTH CHECK & TEST ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'pennyprose-backend-modular',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test successful',
    framework: 'NestJS-style with Express (Modular)',
    timestamp: new Date().toISOString(),
    features: [
      'Posts Management',
      'Categories Management',
      'Tags Management',
      'Comments System',
      'Admin Dashboard',
      'Bulk Operations',
      'Content Analytics'
    ]
  });
});

// ============================================================================
// ARCHIVE ENDPOINTS (Public)
// ============================================================================

// Get posts archive (grouped by year and month)
app.get('/api/archive', async (req, res) => {
  try {
    const archive = await adminService.getPostsArchive();
    res.json({ archive });
  } catch (error) {
    console.error('Error fetching posts archive:', error);
    res.status(500).json({ error: 'Failed to fetch posts archive' });
  }
});

// Get posts by specific year and month
app.get('/api/archive/:year/:month', async (req, res) => {
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
// API ROUTES
// ============================================================================

// Mount routes
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/admin', adminRoutes);

// Legacy routes for backward compatibility
app.use('/api', commentsRoutes); // For /api/posts/:slug/comments

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 PennyProse Backend Server (Modular) running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: SQLite with Prisma`);
  console.log(`🔧 Framework: Express (NestJS-style)`);
  console.log(`📁 Features: Posts, Categories, Tags, Comments, Admin Dashboard`);
  console.log(`🔐 Authentication: Ready for implementation`);
  console.log(`\n📋 Available API Endpoints:`);
  console.log(`   GET    /health                           - Health check`);
  console.log(`   GET    /api/test                         - Test endpoint`);
  console.log(`   \n📝 Posts:`);
  console.log(`   GET    /api/posts                        - Get all posts`);
  console.log(`   GET    /api/posts/:slug                  - Get single post`);
  console.log(`   GET    /api/posts/admin                  - Get all posts (admin)`);
  console.log(`   POST   /api/posts                        - Create post (admin)`);
  console.log(`   PUT    /api/posts/:id                    - Update post (admin)`);
  console.log(`   PATCH  /api/posts/:id/status             - Update post status (admin)`);
  console.log(`   DELETE /api/posts/:id                    - Delete post (admin)`);
  console.log(`   \n📂 Categories:`);
  console.log(`   GET    /api/categories                   - Get all categories`);
  console.log(`   GET    /api/categories/:slug/posts       - Get category posts`);
  console.log(`   POST   /api/categories                   - Create category (admin)`);
  console.log(`   PUT    /api/categories/:id               - Update category (admin)`);
  console.log(`   DELETE /api/categories/:id               - Delete category (admin)`);
  console.log(`   \n🏷️  Tags:`);
  console.log(`   GET    /api/tags                         - Get all tags`);
  console.log(`   GET    /api/tags/:slug/posts             - Get tag posts`);
  console.log(`   POST   /api/tags                         - Create tag (admin)`);
  console.log(`   PUT    /api/tags/:id                     - Update tag (admin)`);
  console.log(`   DELETE /api/tags/:id                     - Delete tag (admin)`);
  console.log(`   \n💬 Comments:`);
  console.log(`   GET    /api/posts/:slug/comments         - Get post comments`);
  console.log(`   POST   /api/posts/:slug/comments         - Create comment`);
  console.log(`   PUT    /api/comments/:id                 - Update comment`);
  console.log(`   DELETE /api/comments/:id                 - Delete comment (admin)`);
  console.log(`   GET    /api/comments/admin               - Get all comments (admin)`);
  console.log(`   PATCH  /api/comments/:id/status          - Update comment status (admin)`);
  console.log(`   \n� Archive:`);
  console.log(`   GET    /api/archive                      - Posts archive`);
  console.log(`   GET    /api/archive/:year/:month         - Posts by year/month`);

  console.log(`   \n�🛠️  Admin:`);
  console.log(`   GET    /api/admin/dashboard              - Dashboard stats`);
  console.log(`   GET    /api/admin/stats                  - Admin statistics`);
  console.log(`   GET    /api/admin/posts                  - Admin posts management`);
  console.log(`   GET    /api/admin/overview               - System overview`);
  console.log(`   GET    /api/admin/analytics              - Content analytics`);
  console.log(`   GET    /api/admin/archive                - Posts archive`);
  console.log(`   GET    /api/admin/archive/:year/:month   - Posts by year/month`);
  console.log(`   GET    /api/admin/users                  - User management`);
  console.log(`   PATCH  /api/admin/users/:id/role         - Update user role`);
  console.log(`   DELETE /api/admin/users/:id              - Delete user`);
  console.log(`\n✨ Ready to serve requests!`);
});