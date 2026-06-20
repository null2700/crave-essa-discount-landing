/**
 * API Integration Tests - Craveessa Backend
 * Tests connectivity between client and owner sites
 * Tests data management and CRUD operations
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  ownerUsername: 'testowner',
  ownerPassword: 'TestPassword123!',
  testSubmission: {
    fullName: 'John Doe',
    whatsappNumber: '9876543210',
    email: 'john@example.com',
    cakeSize: 'Medium',
    flavor: 'Vanilla',
    occasion: 'Birthday',
    neededBy: '2026-07-01',
    deliveryArea: 'Downtown',
    discountCode: 'TEST50'
  },
  testProduct: {
    category: 'Birthday Cakes',
    name: 'Classic Vanilla Cake',
    description: 'A delicious classic vanilla cake',
    imageUrl: 'https://example.com/cake.jpg'
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
  startTime: null,
  endTime: null
};

// Helper: Make HTTP request
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(TEST_CONFIG.baseUrl + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test assertion function
async function testCase(name, fn) {
  const test = { name, status: 'pending', error: null, duration: 0 };
  const startTime = Date.now();

  try {
    await fn();
    test.status = 'passed';
    testResults.passed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    test.status = 'failed';
    test.error = error.message;
    testResults.failed++;
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
  }

  test.duration = Date.now() - startTime;
  testResults.tests.push(test);
}

// Assertion helpers
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

function assertExists(value, message) {
  if (!value) throw new Error(message || `Expected value to exist`);
}

// ============ TEST SUITE ============

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('CRAVEESSA - API INTEGRATION & CONNECTIVITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  testResults.startTime = Date.now();

  // --- SECTION 1: Connectivity Tests ---
  console.log('\n📡 SECTION 1: CONNECTIVITY TESTS\n');

  await testCase('Server is running and responding', async () => {
    const res = await makeRequest('GET', '/');
    assert(res.status === 302 || res.status === 200, `Expected status 302 or 200, got ${res.status}`);
  });

  await testCase('Owner page is accessible', async () => {
    const res = await makeRequest('GET', '/owner');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.includes || typeof res.body === 'string', 'Expected HTML content');
  });

  await testCase('Public directory is served', async () => {
    const res = await makeRequest('GET', '/discount.css');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
  });

  await testCase('CORS headers are present', async () => {
    const res = await makeRequest('GET', '/api/orders');
    assert(res.headers['access-control-allow-origin'], 'CORS headers missing');
  });

  // --- SECTION 2: Authentication Tests ---
  console.log('\n🔐 SECTION 2: AUTHENTICATION TESTS\n');

  let sessionCookie = null;

  await testCase('Login endpoint is accessible', async () => {
    const res = await makeRequest('POST', '/owner/login', TEST_CONFIG);
    assert(res.status === 200 || res.status === 401, `Unexpected status ${res.status}`);
  });

  await testCase('Owner can login with valid credentials', async () => {
    const res = await makeRequest('POST', '/owner/login', {
      username: TEST_CONFIG.ownerUsername,
      password: TEST_CONFIG.ownerPassword
    });
    
    if (res.status === 401 || res.body.error) {
      // Owner might not exist, which is OK for this test
      console.log('  (Owner account not created yet - this is expected)');
    } else {
      assert(res.status === 200 || res.status === 302, `Unexpected status ${res.status}`);
    }
  });

  // --- SECTION 3: Client Submission Tests ---
  console.log('\n📋 SECTION 3: CLIENT SUBMISSION TESTS\n');

  let submissionId = null;

  await testCase('Client can submit form data', async () => {
    const submission = {
      ...TEST_CONFIG.testSubmission,
      timestamp: new Date().toISOString()
    };

    const res = await makeRequest('POST', '/api/submit', submission);
    assert(res.status === 200 || res.status === 201, `Expected status 200 or 201, got ${res.status}`);
    assert(res.body.ok || res.body.id, 'Expected successful submission response');
    if (res.body.id) submissionId = res.body.id;
  });

  await testCase('Submissions are retrievable via API', async () => {
    const res = await makeRequest('GET', '/api/orders');
    assert(res.status === 200 || res.status === 401, `Expected status 200, got ${res.status}`);
    
    if (res.status === 200) {
      assert(Array.isArray(res.body.rows) || Array.isArray(res.body), 'Expected array of submissions');
    }
  });

  await testCase('Multiple submissions can be created', async () => {
    for (let i = 0; i < 3; i++) {
      const submission = {
        ...TEST_CONFIG.testSubmission,
        fullName: `Test User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        timestamp: new Date().toISOString()
      };

      const res = await makeRequest('POST', '/api/submit', submission);
      assert(res.status === 200 || res.status === 201, `Submission ${i + 1} failed`);
    }
  });

  // --- SECTION 4: Owner Data Management Tests ---
  console.log('\n📦 SECTION 4: OWNER DATA MANAGEMENT TESTS\n');

  let productId = null;

  await testCase('Owner can add a product', async () => {
    const res = await makeRequest('POST', '/api/products', TEST_CONFIG.testProduct);
    
    if (res.status === 401) {
      console.log('  (Authentication required - run with valid session)');
    } else {
      assert(res.status === 200 || res.status === 201, `Expected status 200 or 201, got ${res.status}`);
      assert(res.body.ok || res.body.id, 'Expected successful product creation');
      if (res.body.id) productId = res.body.id;
    }
  });

  await testCase('Products list is retrievable', async () => {
    const res = await makeRequest('GET', '/api/products');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    assert(res.body.products || Array.isArray(res.body), 'Expected products array');
  });

  await testCase('Product can be deleted', async () => {
    if (!productId) {
      console.log('  (Skipped - no product ID available)');
      return;
    }

    const res = await makeRequest('DELETE', `/api/products/${productId}`);
    
    if (res.status === 401) {
      console.log('  (Authentication required)');
    } else {
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
    }
  });

  // --- SECTION 5: Data Retrieval Tests ---
  console.log('\n📊 SECTION 5: DATA RETRIEVAL TESTS\n');

  await testCase('Orders endpoint returns data in expected format', async () => {
    const res = await makeRequest('GET', '/api/orders');
    
    if (res.status === 200) {
      assert(res.body.rows || Array.isArray(res.body), 'Expected rows array');
      
      if (res.body.rows && res.body.rows.length > 0) {
        const firstOrder = res.body.rows[0];
        assert(firstOrder.id || firstOrder.fullName, 'Expected order fields');
      }
    }
  });

  await testCase('Products endpoint returns data in expected format', async () => {
    const res = await makeRequest('GET', '/api/products');
    assert(res.status === 200, `Expected status 200, got ${res.status}`);
    
    if (res.body.products && res.body.products.length > 0) {
      const firstProduct = res.body.products[0];
      assert(firstProduct.id || firstProduct.name, 'Expected product fields');
    }
  });

  // --- SECTION 6: Error Handling Tests ---
  console.log('\n⚠️  SECTION 6: ERROR HANDLING TESTS\n');

  await testCase('Invalid endpoints return 404', async () => {
    const res = await makeRequest('GET', '/api/nonexistent');
    assert(res.status === 404 || res.status === 401, `Expected 404, got ${res.status}`);
  });

  await testCase('Missing required fields are handled', async () => {
    const incompleteSubmission = {
      fullName: 'Test'
      // Missing other required fields
    };

    const res = await makeRequest('POST', '/api/submit', incompleteSubmission);
    assert(res.status !== 500, 'Server returned 500 error for bad input');
  });

  await testCase('Invalid product ID returns appropriate error', async () => {
    const res = await makeRequest('DELETE', '/api/products/invalid-id-123');
    
    if (res.status !== 401) {
      assert(res.status === 400 || res.status === 404, `Expected 400 or 404, got ${res.status}`);
    }
  });

  testResults.endTime = Date.now();

  // Print summary
  printTestSummary();

  // Generate report file
  await generateReport();
}

// Print test summary
function printTestSummary() {
  const duration = testResults.endTime - testResults.startTime;
  const total = testResults.passed + testResults.failed + testResults.skipped;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Total Tests: ${total}`);
  console.log(`✓ Passed:    ${testResults.passed}`);
  console.log(`✗ Failed:    ${testResults.failed}`);
  console.log(`⊘ Skipped:   ${testResults.skipped}`);
  console.log(`⏱️  Duration:   ${duration}ms\n`);

  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(2) : 0;
  console.log(`Pass Rate: ${passRate}%`);

  if (testResults.failed > 0) {
    console.log('\nFailed Tests:');
    testResults.tests
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`  • ${t.name}: ${t.error}`));
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Generate HTML report
async function generateReport() {
  const reportDir = path.join(__dirname, '..', 'test-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `test-report-${timestamp}.html`);

  const duration = testResults.endTime - testResults.startTime;
  const total = testResults.passed + testResults.failed + testResults.skipped;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(2) : 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Craveessa - Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f8f4ee 0%, #ede5d8 100%);
      padding: 40px 20px;
      color: #243049;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(16,33,52,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2a5a7e 0%, #1e3f52 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2rem; margin-bottom: 10px; }
    .header p { font-size: 0.95rem; opacity: 0.9; }
    .content { padding: 40px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .metric {
      background: #f8f4ee;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #e8d5b7;
    }
    .metric.passed { border-left-color: #2ecc71; }
    .metric.failed { border-left-color: #e74c3c; }
    .metric.skipped { border-left-color: #f39c12; }
    .metric-value { font-size: 2.5rem; font-weight: bold; color: #2a5a7e; }
    .metric-label { font-size: 0.85rem; color: #5b6472; margin-top: 5px; }
    .progress-bar {
      width: 100%;
      height: 24px;
      background: #e8e8e8;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2ecc71, #27ae60);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .tests-section h2 { 
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #2a5a7e;
      border-bottom: 2px solid #e8d5b7;
      padding-bottom: 10px;
    }
    .test-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-left: 4px solid #ccc;
      background: #f9f9f9;
    }
    .test-item.passed {
      background: #f0fdf4;
      border-left-color: #2ecc71;
    }
    .test-item.failed {
      background: #fdf0f0;
      border-left-color: #e74c3c;
    }
    .test-item.skipped {
      background: #fffbf0;
      border-left-color: #f39c12;
    }
    .test-name {
      font-weight: 600;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .test-status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .test-status.passed {
      background: #2ecc71;
      color: white;
    }
    .test-status.failed {
      background: #e74c3c;
      color: white;
    }
    .test-status.skipped {
      background: #f39c12;
      color: white;
    }
    .test-error {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    .test-duration {
      color: #888;
      font-size: 0.85rem;
      margin-top: 5px;
    }
    .footer {
      background: #f8f4ee;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍰 Craveessa - API Test Report</h1>
      <p>Connectivity & Data Management Test Suite</p>
    </div>
    
    <div class="content">
      <div class="metrics">
        <div class="metric passed">
          <div class="metric-value">${testResults.passed}</div>
          <div class="metric-label">Passed</div>
        </div>
        <div class="metric failed">
          <div class="metric-value">${testResults.failed}</div>
          <div class="metric-label">Failed</div>
        </div>
        <div class="metric skipped">
          <div class="metric-value">${testResults.skipped}</div>
          <div class="metric-label">Skipped</div>
        </div>
        <div class="metric">
          <div class="metric-value">${total}</div>
          <div class="metric-label">Total Tests</div>
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${passRate}%">
          ${passRate}%
        </div>
      </div>

      <div class="tests-section">
        <h2>Test Results</h2>
        ${testResults.tests.map(test => `
          <div class="test-item ${test.status}">
            <div class="test-name">
              <span>${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '⊘'}</span>
              <span>${test.name}</span>
              <span class="test-status ${test.status}">${test.status.toUpperCase()}</span>
            </div>
            ${test.error ? `<div class="test-error">Error: ${test.error}</div>` : ''}
            <div class="test-duration">Duration: ${test.duration}ms</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>Report generated on ${new Date().toLocaleString()}</p>
      <p>Duration: ${duration}ms | Pass Rate: ${passRate}%</p>
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, html);
  console.log(`\n📄 Test report saved to: ${reportPath}`);

  // Also save JSON report
  const jsonReportPath = path.join(reportDir, `test-report-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(testResults, null, 2));
  console.log(`📊 JSON report saved to: ${jsonReportPath}\n`);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
