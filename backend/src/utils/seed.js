import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Phodal Huang',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Full-stack developer and AI enthusiast. Passionate about modern web technologies and developer tools.'
    }
  })

  console.log('✅ Admin user created:', admin.username)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'ai' },
      update: {},
      create: {
        name: 'AI',
        slug: 'ai',
        description: 'Artificial Intelligence and Machine Learning',
        color: '#3B82F6'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        description: 'Software Development and Programming',
        color: '#10B981'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'development' },
      update: {},
      create: {
        name: 'Development',
        slug: 'development',
        description: 'Web Development and Tools',
        color: '#8B5CF6'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest Technology Trends',
        color: '#F59E0B'
      }
    })
  ])

  console.log('✅ Categories created:', categories.length)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'autodev' },
      update: {},
      create: { name: 'AutoDev', slug: 'autodev', color: '#3B82F6' }
    }),
    prisma.tag.upsert({
      where: { slug: 'remote' },
      update: {},
      create: { name: 'Remote', slug: 'remote', color: '#10B981' }
    }),
    prisma.tag.upsert({
      where: { slug: 'ai' },
      update: {},
      create: { name: 'AI', slug: 'ai', color: '#8B5CF6' }
    }),
    prisma.tag.upsert({
      where: { slug: 'programming' },
      update: {},
      create: { name: 'Programming', slug: 'programming', color: '#F59E0B' }
    }),
    prisma.tag.upsert({
      where: { slug: 'context' },
      update: {},
      create: { name: 'Context', slug: 'context', color: '#EF4444' }
    }),
    prisma.tag.upsert({
      where: { slug: 'experience' },
      update: {},
      create: { name: 'Experience', slug: 'experience', color: '#06B6D4' }
    }),
    prisma.tag.upsert({
      where: { slug: 'ide' },
      update: {},
      create: { name: 'IDE', slug: 'ide', color: '#84CC16' }
    })
  ])

  console.log('✅ Tags created:', tags.length)

  // Create posts
  const posts = [
    {
      title: 'AutoDev Remote 编程体验：你的必备AI 在云天大有所求、设计方案',
      slug: 'autodev-remote-programming-experience',
      excerpt: '在最新 AutoDev Next 的发布，我们介绍了 AutoDev 一个新的一些现代化的。而 AutoDev Remote Agent 则是其中一个重要的组成的。',
      content: `# AutoDev Remote 编程体验

在最新 AutoDev Next 的发布，我们介绍了 AutoDev 一个新的一些现代化的。而 AutoDev Remote Agent 则是其中一个重要的组成的。

## 什么是 AutoDev Remote？

AutoDev Remote 是一个基于云端的AI编程助手，它能够：

- 提供智能代码补全
- 自动生成代码文档
- 进行代码审查和优化建议
- 支持多种编程语言

## 核心特性

### 1. 智能代码生成

通过自然语言描述，AutoDev Remote 可以生成高质量的代码：

\`\`\`javascript
// 示例：生成一个用户认证函数
function authenticateUser(username, password) {
  // AI生成的代码
  return validateCredentials(username, password)
    .then(user => generateToken(user))
    .catch(error => handleAuthError(error));
}
\`\`\`

### 2. 上下文感知

AutoDev Remote 能够理解项目的整体架构和上下文，提供更准确的建议。

### 3. 实时协作

支持团队成员之间的实时代码协作和知识分享。

## 使用体验

在实际使用过程中，AutoDev Remote 展现出了以下优势：

1. **高效性** - 显著提升开发效率
2. **准确性** - 生成的代码质量高
3. **易用性** - 学习成本低，上手快

## 总结

AutoDev Remote 为现代软件开发带来了新的可能性，是每个开发者都应该尝试的工具。`,
      status: 'PUBLISHED',
      featured: true,
      categoryId: categories[0].id, // AI
      tagIds: [tags[0].id, tags[1].id, tags[2].id], // AutoDev, Remote, AI
      publishedAt: new Date('2025-06-13T22:06:00Z')
    },
    {
      title: 'AutoDev 视上文引擎：预生成代码引文化信息，构建 AI 编程的知识真空',
      slug: 'autodev-context-engine',
      excerpt: '在本文《视上文引擎》的发布中，我们介绍了预生成上文化引文化引文',
      content: `# AutoDev 视上文引擎

在本文《视上文引擎》的发布中，我们介绍了预生成上文化引文化引文。

## 上下文引擎的重要性

上下文引擎是AI编程助手的核心组件，它能够：

- 理解代码的语义和结构
- 提供精准的代码建议
- 维护项目的一致性

## 技术实现

我们采用了先进的自然语言处理技术来构建这个引擎。

## 应用场景

上下文引擎在以下场景中表现出色：

1. 代码补全
2. 重构建议
3. 错误检测
4. 文档生成

## 未来展望

我们将继续优化上下文引擎，使其更加智能和高效。`,
      status: 'PUBLISHED',
      categoryId: categories[0].id, // AI
      tagIds: [tags[0].id, tags[2].id, tags[4].id], // AutoDev, AI, Context
      publishedAt: new Date('2025-05-28T10:11:00Z')
    },
    {
      title: '两周 3 万行代码：我们的 7 个 AI "采坑"来编程实践',
      slug: 'two-weeks-30k-lines-ai-programming',
      excerpt: '在过去的两周，在我们了及 AutoDev Workbench 的过程中，大量使用了 AI 编程的技术的。作为过去，为过去在研究了。',
      content: `# 两周 3 万行代码：我们的 7 个 AI "采坑"来编程实践

在过去的两周，在我们了及 AutoDev Workbench 的过程中，大量使用了 AI 编程的技术的。

## 项目背景

AutoDev Workbench 是一个全新的开发环境，我们决定大胆尝试AI辅助编程。

## 7 个重要经验

### 1. 代码质量控制

AI生成的代码需要严格的质量控制流程。

### 2. 测试驱动开发

TDD在AI编程中变得更加重要。

### 3. 代码审查

人工审查仍然是不可替代的环节。

### 4. 架构设计

AI在架构设计方面还需要人工指导。

### 5. 性能优化

AI生成的代码往往需要性能优化。

### 6. 安全考虑

安全性检查必须由人工完成。

### 7. 文档维护

AI可以帮助生成文档，但维护仍需人工。

## 总结

AI编程是未来的趋势，但需要合理的使用策略。`,
      status: 'PUBLISHED',
      categoryId: categories[1].id, // Programming
      tagIds: [tags[2].id, tags[3].id, tags[5].id], // AI, Programming, Experience
      publishedAt: new Date('2025-05-27T22:57:00Z')
    },
    {
      title: 'AutoDev 智能开发环境：上下文收集的 AI 编程开发平台',
      slug: 'autodev-intelligent-development-environment',
      excerpt: '智能开发环境是新一代的开发工具，它能够理解代码上下文，提供智能化的编程辅助。',
      content: `# AutoDev 智能开发环境

智能开发环境是新一代的开发工具，它能够理解代码上下文，提供智能化的编程辅助。

## 核心功能

### 智能代码补全

基于上下文的智能代码补全，准确率高达95%。

### 自动重构

智能识别代码异味，提供重构建议。

### 实时错误检测

在编码过程中实时检测潜在错误。

### 智能文档生成

自动生成API文档和代码注释。

## 技术架构

我们采用了微服务架构，确保系统的可扩展性和稳定性。

## 使用体验

开发者反馈表明，使用AutoDev后开发效率提升了40%。

## 未来规划

我们将继续完善智能开发环境，添加更多实用功能。`,
      status: 'PUBLISHED',
      categoryId: categories[2].id, // Development
      tagIds: [tags[0].id, tags[6].id, tags[2].id], // AutoDev, IDE, AI
      publishedAt: new Date('2025-05-25T09:30:00Z')
    }
  ]

  for (const postData of posts) {
    const { tagIds, ...postInfo } = postData
    
    const post = await prisma.post.create({
      data: {
        ...postInfo,
        authorId: admin.id,
        readTime: Math.ceil(postInfo.content.split(' ').length / 200), // Estimate read time
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        }
      }
    })

    console.log('✅ Post created:', post.title)
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
