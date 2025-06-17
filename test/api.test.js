// API Integration Tests
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost/api';
let authToken = '';

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test utilities
const test = async (name, fn) => {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
};

// API Tests
const tests = {
  // Health check
  async healthCheck() {
    const response = await axios.get(`${API_URL}/health`);
    if (response.status !== 200) throw new Error('Health check failed');
    if (!response.data.status === 'ok') throw new Error('API not healthy');
  },

  // Authentication
  async login() {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    if (!response.data.access_token) throw new Error('No access token received');
    authToken = response.data.access_token;
  },

  // KOL Management
  async createKOL() {
    const response = await axios.post(`${API_URL}/kols`, {
      username: '@testuser',
      followersCount: 1000000,
      category: 'tech'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.id) throw new Error('KOL creation failed');
    return response.data.id;
  },

  async listKOLs() {
    const response = await axios.get(`${API_URL}/kols`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data)) throw new Error('Invalid KOL list response');
  },

  // Event Management
  async createEvent() {
    const response = await axios.post(`${API_URL}/events`, {
      name: 'Test Event',
      keywords: ['test', 'demo'],
      description: 'Test event for system check'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.id) throw new Error('Event creation failed');
    return response.data.id;
  },

  // Emotion Statistics
  async getEmotionStats() {
    const response = await axios.get(`${API_URL}/emotions/statistics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data) throw new Error('No emotion statistics returned');
  },

  // WebSocket test
  async testWebSocket() {
    const io = require('socket.io-client');
    const socket = io(API_URL.replace('/api', ''), {
      transports: ['websocket']
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        reject(new Error('WebSocket connection failed'));
      });

      setTimeout(() => {
        socket.disconnect();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
    });
  }
};

// Run all tests
async function runTests() {
  console.log('🧪 Running API Integration Tests');
  console.log('================================\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // Test sequence
  const testSequence = [
    ['Health Check', tests.healthCheck],
    ['Authentication - Login', tests.login],
    ['KOL - Create', tests.createKOL],
    ['KOL - List', tests.listKOLs],
    ['Event - Create', tests.createEvent],
    ['Emotion - Get Statistics', tests.getEmotionStats],
    ['WebSocket Connection', tests.testWebSocket]
  ];

  for (const [name, testFn] of testSequence) {
    const passed = await test(name, testFn);
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  console.log('\n================================');
  console.log('Test Summary:');
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}✅ All API tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed.${colors.reset}`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if axios is installed
try {
  require('axios');
  require('socket.io-client');
} catch (e) {
  console.log('Installing test dependencies...');
  require('child_process').execSync('npm install axios socket.io-client', { stdio: 'inherit' });
}

// Run tests
runTests().catch(console.error);