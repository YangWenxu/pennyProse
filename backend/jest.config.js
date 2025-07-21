export default {
  // 使用ES模块
  preset: 'default',
  
  // 测试环境
  testEnvironment: 'node',
  
  // 支持ES模块
  extensionsToTreatAsEsm: ['.js'],
  
  // 模块名映射
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // 转换配置
  transform: {},
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // 设置文件
  setupFilesAfterEnv: [],
  
  // 超时设置
  testTimeout: 10000,
  
  // 详细输出
  verbose: true
};
