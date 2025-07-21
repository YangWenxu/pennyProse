/**
 * 后端API测试
 */
import request from 'supertest';
import app from '../src/main.js';

describe('Backend API Tests', () => {

  // 健康检查测试
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // 博客API测试
  describe('Blog API', () => {
    it('should get all articles', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new article', async () => {
      const newArticle = {
        title: 'Test Article',
        content: 'This is a test article content.',
        category: 'test',
        tags: ['test', 'api']
      };

      const response = await request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newArticle.title);
    });
  });

  // 分类API测试
  describe('Categories API', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // 标签API测试
  describe('Tags API', () => {
    it('should get all tags', async () => {
      const response = await request(app)
        .get('/api/tags')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // 错误处理测试
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    it('should handle invalid article ID', async () => {
      await request(app)
        .get('/api/articles/invalid-id')
        .expect(400);
    });
  });

});
