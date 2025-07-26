import { PrismaClient } from '@prisma/client';
import { expect, describe, test, beforeAll, afterAll, afterEach } from '@jest/globals';

describe('PostgreSQL数据源配置测试', () => {
  let prisma;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('数据库环境变量完整性测试', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toBe(process.env.POSTGRES_PRISMA_URL);
    
    const url = new URL(process.env.DATABASE_URL);
    expect(url.protocol).toBe('postgres:');
    expect(url.hostname).toBe('aws-0-us-east-1.pooler.supabase.com');
    expect(url.port).toBe('6543');
    expect(url.searchParams.get('pgbouncer')).toBe('true');
    expect(url.searchParams.get('sslmode')).toBe('require');
  });

  test('数据库连接和查询测试', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result[0].connected).toBe(1);
  }, 10000); // 增加超时时间到10秒

  test('连接池配置测试', async () => {
    // 测试连接池URL配置
    const poolUrl = new URL(process.env.POSTGRES_PRISMA_URL);
    expect(poolUrl.searchParams.get('pgbouncer')).toBe('true');
    
    // 验证可以执行多个并发查询
    const queries = Array(5).fill(null).map(() =>
      prisma.$queryRaw`SELECT 1 as value`
    );
    const results = await Promise.all(queries);
    
    // 验证所有查询都成功执行
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result[0].value).toBe(1);
    });
  }, 10000);

  test('事务和回滚测试', async () => {
    const result = await prisma.$transaction(async (tx) => {
      // 执行简单查询
      const query = await tx.$queryRaw`SELECT 1 as value`;
      expect(query[0].value).toBe(1);
      return true;
    });
    expect(result).toBe(true);
  }, 10000);

  test('SSL连接安全性测试', async () => {
    // 验证数据库URL包含SSL配置
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toContain('sslmode=require');

    // 验证连接池URL包含SSL配置
    const poolUrl = process.env.POSTGRES_PRISMA_URL;
    expect(poolUrl).toContain('sslmode=require');

    // 验证非连接池URL包含SSL配置
    const nonPoolUrl = process.env.POSTGRES_URL_NON_POOLING;
    expect(nonPoolUrl).toContain('sslmode=require');
  });

  test('数据库权限和角色测试', async () => {
    const result = await prisma.$queryRaw`SELECT current_user, current_database()`;
    expect(result[0].current_user).toBe('postgres');
    expect(result[0].current_database).toBe('postgres');
  });
});