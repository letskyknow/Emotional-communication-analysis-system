// Load Testing Script
// Tests system performance under load

const axios = require('axios');
const WebSocket = require('ws');

const API_URL = process.env.API_URL || 'http://localhost/api';
const WS_URL = process.env.WS_URL || 'ws://localhost/socket.io';

// Test configuration
const config = {
  concurrent_users: 10,
  requests_per_user: 100,
  test_duration: 30000, // 30 seconds
  ramp_up_time: 5000 // 5 seconds
};

// Metrics
const metrics = {
  requests: {
    total: 0,
    success: 0,
    failed: 0
  },
  response_times: [],
  errors: [],
  start_time: null,
  end_time: null
};

// Generate test data
function generateTestData() {
  return {
    kol: {
      username: `@testuser_${Math.random().toString(36).substring(7)}`,
      followersCount: Math.floor(Math.random() * 1000000),
      category: ['tech', 'finance', 'crypto'][Math.floor(Math.random() * 3)]
    },
    event: {
      name: `Test Event ${Date.now()}`,
      keywords: ['test', 'load', 'performance'],
      description: 'Load test event'
    }
  };
}

// API request function
async function makeRequest(endpoint, method = 'GET', data = null) {
  const start = Date.now();
  metrics.requests.total++;

  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    const responseTime = Date.now() - start;
    metrics.response_times.push(responseTime);
    metrics.requests.success++;

    return { success: true, responseTime };
  } catch (error) {
    metrics.requests.failed++;
    metrics.errors.push({
      endpoint,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error: error.message };
  }
}

// Simulate user behavior
async function simulateUser(userId) {
  console.log(`User ${userId} started`);
  
  // Random delay for ramp-up
  await new Promise(resolve => setTimeout(resolve, Math.random() * config.ramp_up_time));

  const endTime = Date.now() + config.test_duration;
  let requestCount = 0;

  while (Date.now() < endTime && requestCount < config.requests_per_user) {
    // Random API calls
    const actions = [
      () => makeRequest('/health'),
      () => makeRequest('/kols'),
      () => makeRequest('/events'),
      () => makeRequest('/emotions/statistics'),
      () => makeRequest('/kols', 'POST', generateTestData().kol),
      () => makeRequest('/events', 'POST', generateTestData().event)
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();
    
    requestCount++;
    
    // Random think time between requests (100-500ms)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
  }

  console.log(`User ${userId} completed ${requestCount} requests`);
}

// WebSocket load test
async function testWebSocket() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    const messages = [];
    
    ws.on('open', () => {
      console.log('WebSocket connected');
      
      // Send test messages
      for (let i = 0; i < 10; i++) {
        ws.send(JSON.stringify({
          type: 'test',
          data: { index: i, timestamp: Date.now() }
        }));
      }
    });

    ws.on('message', (data) => {
      messages.push(data);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Close after 5 seconds
    setTimeout(() => {
      ws.close();
      resolve(messages.length);
    }, 5000);
  });
}

// Calculate statistics
function calculateStats() {
  const sortedTimes = [...metrics.response_times].sort((a, b) => a - b);
  const sum = sortedTimes.reduce((a, b) => a + b, 0);
  
  return {
    avg: sum / sortedTimes.length || 0,
    min: sortedTimes[0] || 0,
    max: sortedTimes[sortedTimes.length - 1] || 0,
    p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0,
    p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0,
    p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
  };
}

// Main load test function
async function runLoadTest() {
  console.log('🚀 Starting Load Test');
  console.log('====================');
  console.log(`Concurrent users: ${config.concurrent_users}`);
  console.log(`Requests per user: ${config.requests_per_user}`);
  console.log(`Test duration: ${config.test_duration / 1000}s`);
  console.log('');

  metrics.start_time = Date.now();

  // Create user promises
  const userPromises = [];
  for (let i = 1; i <= config.concurrent_users; i++) {
    userPromises.push(simulateUser(i));
  }

  // Run WebSocket test in parallel
  const wsPromise = testWebSocket();

  // Wait for all users to complete
  await Promise.all([...userPromises, wsPromise]);

  metrics.end_time = Date.now();

  // Calculate and display results
  const duration = (metrics.end_time - metrics.start_time) / 1000;
  const stats = calculateStats();
  const throughput = metrics.requests.total / duration;

  console.log('\n📊 Load Test Results');
  console.log('===================');
  console.log(`Test Duration: ${duration.toFixed(2)}s`);
  console.log(`Total Requests: ${metrics.requests.total}`);
  console.log(`Successful: ${metrics.requests.success} (${((metrics.requests.success / metrics.requests.total) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${metrics.requests.failed} (${((metrics.requests.failed / metrics.requests.total) * 100).toFixed(2)}%)`);
  console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
  
  console.log('\n⏱️  Response Times (ms)');
  console.log('=====================');
  console.log(`Average: ${stats.avg.toFixed(2)}ms`);
  console.log(`Min: ${stats.min}ms`);
  console.log(`Max: ${stats.max}ms`);
  console.log(`P50: ${stats.p50}ms`);
  console.log(`P95: ${stats.p95}ms`);
  console.log(`P99: ${stats.p99}ms`);

  if (metrics.errors.length > 0) {
    console.log('\n❌ Errors');
    console.log('========');
    const errorSummary = {};
    metrics.errors.forEach(error => {
      errorSummary[error.error] = (errorSummary[error.error] || 0) + 1;
    });
    
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`${error}: ${count} occurrences`);
    });
  }

  // Performance assessment
  console.log('\n🎯 Performance Assessment');
  console.log('=======================');
  
  if (stats.avg < 200 && metrics.requests.failed / metrics.requests.total < 0.01) {
    console.log('✅ Excellent: System performs well under load');
  } else if (stats.avg < 500 && metrics.requests.failed / metrics.requests.total < 0.05) {
    console.log('⚠️  Good: System handles load with minor issues');
  } else {
    console.log('❌ Poor: System struggles under load');
  }

  // Recommendations
  if (stats.p95 > 1000) {
    console.log('\n💡 Recommendations:');
    console.log('- Consider caching frequently accessed data');
    console.log('- Optimize database queries');
    console.log('- Scale horizontally with more instances');
  }
}

// Check dependencies and run test
async function main() {
  try {
    require('axios');
    require('ws');
  } catch (e) {
    console.log('Installing test dependencies...');
    require('child_process').execSync('npm install axios ws', { stdio: 'inherit' });
  }

  try {
    await runLoadTest();
  } catch (error) {
    console.error('Load test failed:', error);
    process.exit(1);
  }
}

main();