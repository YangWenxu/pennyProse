/**
 * Vercel 部署后的数据库初始化脚本
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function setupDatabase() {
  console.log('🚀 开始数据库初始化...');

  try {
    // 1. 运行数据库迁移
    console.log('📦 运行数据库迁移...');
    // 注意: 在 Vercel 中，迁移通常在构建时自动运行
    
    // 2. 检查是否需要创建默认数据
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    
    if (userCount === 0) {
      console.log('👤 创建默认管理员用户...');
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@pennyprose.com',
          name: 'Administrator',
          password: '$2b$10$defaulthashedpassword', // 请更改为实际的哈希密码
          role: 'ADMIN',
        },
      });
    }

    if (categoryCount === 0) {
      console.log('📂 创建默认分类...');
      await prisma.category.createMany({
        data: [
          {
            name: '技术分享',
            slug: 'tech',
            description: '技术相关的文章',
            color: '#3B82F6',
          },
          {
            name: '生活随笔',
            slug: 'life',
            description: '生活感悟和随笔',
            color: '#10B981',
          },
          {
            name: '股票分析',
            slug: 'stocks',
            description: '股票市场分析',
            color: '#F59E0B',
          },
        ],
      });
    }

    // 3. 创建默认标签
    const tagCount = await prisma.tag.count();
    if (tagCount === 0) {
      console.log('🏷️ 创建默认标签...');
      await prisma.tag.createMany({
        data: [
          { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
          { name: 'React', slug: 'react', color: '#61DAFB' },
          { name: 'Node.js', slug: 'nodejs', color: '#339933' },
          { name: '投资', slug: 'investment', color: '#DC2626' },
          { name: '理财', slug: 'finance', color: '#059669' },
        ],
      });
    }

    // 4. 创建示例文章
    const postCount = await prisma.post.count();
    if (postCount === 0) {
      console.log('📝 创建示例文章...');
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      const techCategory = await prisma.category.findFirst({ where: { slug: 'tech' } });
      
      if (admin && techCategory) {
        await prisma.post.create({
          data: {
            title: '欢迎来到 PennyProse',
            slug: 'welcome-to-pennyprose',
            excerpt: '这是一个集博客和股票分析于一体的全栈应用',
            content: `# 欢迎来到 PennyProse

这是一个现代化的全栈应用，集成了：

## 功能特性

- 📝 **博客系统**: 支持 Markdown 编写
- 📊 **股票分析**: 实时数据和技术分析
- 🎨 **现代化UI**: 响应式设计
- 🔐 **用户管理**: 完整的认证系统

## 技术栈

- **前端**: React + Vite + Tailwind CSS
- **后端**: Node.js + Koa + Prisma
- **数据库**: PostgreSQL
- **部署**: GitHub Pages + Vercel

感谢使用 PennyProse！`,
            status: 'PUBLISHED',
            featured: true,
            authorId: admin.id,
            categoryId: techCategory.id,
          },
        });
      }
    }

    console.log('✅ 数据库初始化完成！');
    
    // 5. 输出统计信息
    const stats = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      tags: await prisma.tag.count(),
      posts: await prisma.post.count(),
    };
    
    console.log('📊 数据库统计:', stats);
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('🎉 部署设置完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 部署设置失败:', error);
      process.exit(1);
    });
}

export default setupDatabase;
