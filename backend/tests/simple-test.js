/**
 * 简单的后端API测试
 * 使用原生Node.js HTTP请求，避免ES模块复杂性
 */
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_URL = 'http://localhost:3001';

let serverProcess = null;

// 简单的HTTP请求函数
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            body: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// 启动服务器
function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = join(__dirname, '..', 'src', 'main.js');
    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server:', output.trim());
      if (output.includes('Ready to serve requests') && !serverReady) {
        serverReady = true;
        setTimeout(resolve, 1000); // 等待1秒确保服务器完全启动
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server Error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // 如果5秒内没有启动成功，认为失败
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 5 seconds'));
      }
    }, 5000);
  });
}

// 停止服务器
function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// 等待服务器响应
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await makeRequest('/health');
      return true;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// 测试函数
async function runTests() {
  console.log('🧪 Running Backend API Tests...\n');

  let passed = 0;
  let failed = 0;

  try {
    console.log('Starting server...');
    await startServer();
    console.log('Server started, waiting for it to be ready...');
    await waitForServer();
    console.log('Server is ready!\n');
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.log('\n💥 Server startup failed!');
    process.exit(1);
  }

  // 测试1: 健康检查
  try {
    console.log('Testing GET /health...');
    const response = await makeRequest('/health');
    
    if (response.statusCode === 200 && 
        response.body.status === 'ok' && 
        response.body.timestamp) {
      console.log('✅ Health check test passed');
      passed++;
    } else {
      console.log('❌ Health check test failed:', response);
      failed++;
    }
  } catch (error) {
    console.log('❌ Health check test error:', error.message);
    failed++;
  }

  // 测试2: API测试端点
  try {
    console.log('Testing GET /api/test...');
    const response = await makeRequest('/api/test');
    
    if (response.statusCode === 200 && 
        response.body.message === 'Test successful') {
      console.log('✅ API test endpoint passed');
      passed++;
    } else {
      console.log('❌ API test endpoint failed:', response);
      failed++;
    }
  } catch (error) {
    console.log('❌ API test endpoint error:', error.message);
    failed++;
  }

  // 测试3: 获取文章列表
  try {
    console.log('Testing GET /api/posts...');
    const response = await makeRequest('/api/posts');
    
    if (response.statusCode === 200 && 
        response.body.posts && 
        Array.isArray(response.body.posts)) {
      console.log('✅ Posts API test passed');
      passed++;
    } else {
      console.log('❌ Posts API test failed:', response);
      failed++;
    }
  } catch (error) {
    console.log('❌ Posts API test error:', error.message);
    failed++;
  }

  // 测试结果
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  // 停止服务器
  console.log('\nStopping server...');
  stopServer();

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, stopping server...');
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, stopping server...');
  stopServer();
  process.exit(0);
});

// 运行测试
runTests().catch(error => {
  console.error('Test runner error:', error);
  stopServer();
  process.exit(1);
});
