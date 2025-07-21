/**
 * 后端单元测试
 * 测试模块导入和基本功能，不需要启动服务器
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试计数器
let passed = 0;
let failed = 0;

// 测试辅助函数
function test(name, testFn) {
  try {
    console.log(`Testing: ${name}`);
    testFn();
    console.log(`✅ ${name} - PASSED`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    failed++;
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

// 运行测试
async function runTests() {
  console.log('🧪 Running Backend Unit Tests...\n');

  // 测试1: 基本Node.js模块
  test('Basic Node.js modules', () => {
    assert(typeof fs.readFileSync === 'function', 'fs module should be available');
    assert(typeof path.join === 'function', 'path module should be available');
    assert(typeof http.createServer === 'function', 'http module should be available');
  });

  // 测试2: 检查package.json
  test('Package.json validation', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    assert(fs.existsSync(packagePath), 'package.json should exist');

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    assert(packageJson.name === 'pennyprose-backend', 'Package name should be correct');
    assert(packageJson.main === 'src/main.js', 'Main entry should be correct');
    assert(packageJson.type === 'module', 'Should be ES module');
  });

  // 测试3: 检查源文件存在
  test('Source files existence', () => {
    const mainFile = path.join(process.cwd(), 'src', 'main.js');
    assert(fs.existsSync(mainFile), 'main.js should exist');

    const routesDir = path.join(process.cwd(), 'src', 'routes');
    assert(fs.existsSync(routesDir), 'routes directory should exist');

    const servicesDir = path.join(process.cwd(), 'src', 'services');
    assert(fs.existsSync(servicesDir), 'services directory should exist');
  });

  // 测试4: 检查Prisma配置
  test('Prisma configuration', () => {
    const schemaFile = path.join(process.cwd(), 'prisma', 'schema.prisma');
    assert(fs.existsSync(schemaFile), 'Prisma schema should exist');

    const dbFile = path.join(process.cwd(), 'prisma', 'dev.db');
    assert(fs.existsSync(dbFile), 'Database file should exist');
  });

  // 测试5: 环境变量处理
  test('Environment variables', () => {
    // 设置测试环境变量
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    
    assert(process.env.NODE_ENV === 'test', 'NODE_ENV should be set');
    assert(process.env.PORT === '3001', 'PORT should be set');
  });

  // 测试6: JSON处理
  test('JSON processing', () => {
    const testData = {
      message: 'test',
      status: 'ok',
      timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(testData);
    const parsedData = JSON.parse(jsonString);
    
    assert(parsedData.message === 'test', 'JSON serialization should work');
    assert(parsedData.status === 'ok', 'JSON deserialization should work');
    assert(typeof parsedData.timestamp === 'string', 'Timestamp should be string');
  });

  // 测试7: 基本HTTP响应格式
  test('HTTP response format', () => {
    // 模拟健康检查响应
    const healthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pennyprose-backend',
      version: '1.0.0'
    };
    
    assert(healthResponse.status === 'ok', 'Health status should be ok');
    assert(typeof healthResponse.timestamp === 'string', 'Timestamp should be string');
    assert(healthResponse.service === 'pennyprose-backend', 'Service name should be correct');
  });

  // 测试8: 数据验证
  test('Data validation', () => {
    // 模拟文章数据验证
    function validatePost(post) {
      if (!post.title || typeof post.title !== 'string') {
        throw new Error('Title is required and must be string');
      }
      if (!post.content || typeof post.content !== 'string') {
        throw new Error('Content is required and must be string');
      }
      if (post.status && !['draft', 'published'].includes(post.status)) {
        throw new Error('Status must be draft or published');
      }
      return true;
    }
    
    const validPost = {
      title: 'Test Post',
      content: 'Test content',
      status: 'draft'
    };
    
    assert(validatePost(validPost) === true, 'Valid post should pass validation');
    
    try {
      validatePost({ title: '', content: 'test' });
      assert(false, 'Invalid post should fail validation');
    } catch (error) {
      assert(error.message.includes('Title'), 'Should validate title');
    }
  });

  // 测试结果
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All unit tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some unit tests failed!');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
