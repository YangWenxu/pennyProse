/**
 * 简单的后端API测试
 * 使用原生Node.js HTTP请求，避免ES模块复杂性
 */
import http from 'http';

const BASE_URL = 'http://localhost:3001';

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

// 测试函数
async function runTests() {
  console.log('🧪 Running Backend API Tests...\n');
  
  let passed = 0;
  let failed = 0;

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
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
