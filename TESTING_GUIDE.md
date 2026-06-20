# 🍰 Craveessa - Complete Testing Guide

## Overview

This comprehensive test suite validates:
1. **Connectivity** between client and owner sites
2. **Data Flow** from form submissions to storage
3. **API Endpoints** functionality and reliability
4. **Owner Dashboard** features and data management
5. **Error Handling** and edge cases

---

## Quick Start

### Step 1: Start the Server
```bash
cd owner-railway
npm start
# Server runs on http://localhost:3000
```

### Step 2: Run Tests (in another terminal)
```bash
cd owner-railway

# Option A: Using npm
npm test

# Option B: Direct node
node tests/api.test.js

# Option C: Using batch file (Windows)
tests\run-tests.bat

# Option D: Using shell script (Mac/Linux)
bash tests/run-tests.sh
```

### Step 3: Review Reports
Reports are saved in: `owner-railway/test-reports/`
- `test-report-[timestamp].html` - Beautiful visual report
- `test-report-[timestamp].json` - Machine-readable results

---

## Test Sections Explained

### 1️⃣ CONNECTIVITY TESTS

**What they test:**
- Server responds to requests
- Owner dashboard page loads
- Static files (CSS, JS) are served
- CORS is properly configured

**Why important:**
- Ensures basic infrastructure is working
- Validates server configuration
- Confirms no network isolation issues

**Example Results:**
```
✓ Server is running and responding
✓ Owner page is accessible
✓ Public directory is served
✓ CORS headers are present
```

---

### 2️⃣ AUTHENTICATION TESTS

**What they test:**
- Owner login endpoint works
- Credentials are validated
- Session is created on successful login

**Why important:**
- Ensures owner dashboard security
- Validates authentication middleware
- Confirms access control

**Example Results:**
```
✓ Login endpoint is accessible
✓ Owner can login with valid credentials
```

**Note:** If owner account doesn't exist, this will be marked as expected.

---

### 3️⃣ CLIENT SUBMISSION TESTS

**What they test:**
- Client can submit form data
- Submissions are stored and retrievable
- Multiple submissions can be created
- Data is preserved correctly

**Why important:**
- Validates form data flow from client to server
- Ensures data persistence
- Confirms API reliability from client perspective

**Example Results:**
```
✓ Client can submit form data
✓ Submissions are retrievable via API
✓ Multiple submissions can be created
```

**Test Data Submitted:**
- Name: John Doe
- Phone: 9876543210
- Email: john@example.com
- Cake Size: Medium
- Flavor: Vanilla
- Occasion: Birthday
- Delivery Area: Downtown

---

### 4️⃣ OWNER DATA MANAGEMENT TESTS

**What they test:**
- Owner can add products
- Products are listed correctly
- Products can be deleted
- Data management works end-to-end

**Why important:**
- Validates owner dashboard functionality
- Ensures product catalog works
- Confirms CRUD operations on owner side

**Example Results:**
```
✓ Owner can add a product
✓ Products list is retrievable
✓ Product can be deleted
```

**Test Product:**
- Category: Birthday Cakes
- Name: Classic Vanilla Cake
- Description: A delicious classic vanilla cake
- Image: https://example.com/cake.jpg

---

### 5️⃣ DATA RETRIEVAL TESTS

**What they test:**
- Orders API returns correct data structure
- Products API returns correct data structure
- Data fields are present and accessible

**Why important:**
- Ensures APIs provide data in expected format
- Validates frontend can properly parse responses
- Confirms database queries work correctly

**Example Results:**
```
✓ Orders endpoint returns data in expected format
✓ Products endpoint returns data in expected format
```

---

### 6️⃣ ERROR HANDLING TESTS

**What they test:**
- Invalid endpoints return appropriate errors
- Missing required fields are handled gracefully
- Invalid IDs are rejected properly

**Why important:**
- Ensures robust error handling
- Prevents application crashes
- Provides useful error messages

**Example Results:**
```
✓ Invalid endpoints return 404
✓ Missing required fields are handled
✓ Invalid product ID returns appropriate error
```

---

## Understanding Test Reports

### HTML Report Features

**1. Metrics Dashboard**
```
┌─────────┬─────────┬─────────┬─────────┐
│ Passed  │ Failed  │ Skipped │ Total   │
│   16    │    0    │    2    │   18    │
└─────────┴─────────┴─────────┴─────────┘
```

**2. Progress Bar**
Shows visual representation of pass percentage:
```
████████████████░░ 88.89%
```

**3. Test Details**
Each test shows:
- Status (✓ Passed / ✗ Failed / ⊘ Skipped)
- Test name
- Error message (if failed)
- Duration in milliseconds

**4. Color Coding**
- 🟢 **Green** - Test passed
- 🔴 **Red** - Test failed
- 🟡 **Yellow** - Test skipped

### JSON Report Structure

```json
{
  "passed": 16,
  "failed": 0,
  "skipped": 2,
  "tests": [
    {
      "name": "Server is running and responding",
      "status": "passed",
      "error": null,
      "duration": 45
    },
    {
      "name": "Authentication required test",
      "status": "skipped",
      "error": null,
      "duration": 0
    }
  ],
  "startTime": 1686823456789,
  "endTime": 1686823458956
}
```

---

## Interpreting Results

### ✅ Success Indicators
```
Pass Rate: 88.89% or higher
✓ Passed: 16+
✗ Failed: 0
```

### ⚠️ Warning Signs
```
Pass Rate: Below 50%
✗ Failed: 5+
Multiple connectivity failures
```

### 📋 Expected Skips

Some tests may be skipped if:
- Owner account not yet created
- Product not created in previous test
- Authentication not available
- **This is normal and expected**

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to localhost:3000"
**Solution:**
1. Ensure server is running: `npm start`
2. Check no other process uses port 3000
3. Verify firewall allows connections
4. Try accessing http://localhost:3000 in browser

### Issue 2: "Authentication tests fail"
**Solution:**
1. Create owner account via web interface
2. Update credentials in `api.test.js`
3. Run tests again

### Issue 3: "Data tests show empty results"
**Solution:**
1. This is normal on first run
2. Tests create test data automatically
3. Review HTML report for details
4. Check "Skipped" tests for reasons

### Issue 4: "Connection refused"
**Solution:**
```bash
# Check if port is in use
lsof -i :3000 (Mac/Linux)
netstat -ano | findstr :3000 (Windows)

# Kill the process and restart
npm start
```

---

## Advanced Usage

### Running Specific Tests

Edit `api.test.js` to comment out test sections:

```javascript
// --- SECTION 1: Connectivity Tests --- (keep this)
// --- SECTION 2: Authentication Tests --- (comment out)
// await testCase('Login endpoint is accessible', async () => { ... });
// --- SECTION 3: Client Submission Tests --- (keep this)
```

### Customizing Test Data

Update `TEST_CONFIG` object:

```javascript
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001', // Change port if needed
  ownerUsername: 'yourusername',
  ownerPassword: 'yourpassword',
  testSubmission: {
    fullName: 'Your Test Name',
    // ... modify other fields
  },
  testProduct: {
    category: 'Your Category',
    // ... modify other fields
  }
};
```

### Running Tests Periodically

**Windows Task Scheduler:**
```
Program: C:\Windows\System32\cmd.exe
Arguments: /c cd C:\path\to\owner-railway && npm test
Schedule: Daily at 2:00 AM
```

**Mac/Linux Cron:**
```bash
0 2 * * * cd /path/to/owner-railway && npm test
```

---

## Test Metrics Explained

### Response Time
- **Good:** < 100ms
- **Acceptable:** 100-500ms
- **Concerning:** > 500ms

### Pass Rate
- **Excellent:** 95-100%
- **Good:** 85-95%
- **Acceptable:** 75-85%
- **Poor:** < 75%

### Test Coverage
- **Connectivity:** 4 tests
- **Authentication:** 2 tests
- **Submissions:** 3 tests
- **Data Management:** 3 tests
- **Data Retrieval:** 2 tests
- **Error Handling:** 3 tests
- **Total:** 18 tests

---

## Test Results Examples

### ✅ Perfect Run
```
═══════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════
Total Tests: 18
✓ Passed:    18
✗ Failed:    0
⊘ Skipped:   0
⏱️  Duration:   2450ms
Pass Rate: 100.00%
```

### ⚠️ Normal Run (with skips)
```
═══════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════
Total Tests: 18
✓ Passed:    16
✗ Failed:    0
⊘ Skipped:   2
⏱️  Duration:   3120ms
Pass Rate: 88.89%
```

### ❌ Failed Run
```
═══════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════
Total Tests: 18
✓ Passed:    12
✗ Failed:    4
⊘ Skipped:   2
⏱️  Duration:   4560ms
Pass Rate: 66.67%

Failed Tests:
  • Server is running and responding: Expected status 302 or 200, got 0
  • Owner page is accessible: Expected status 200, got 0
  • Client can submit form data: Expected status 200 or 201, got 0
  • Products list is retrievable: Expected status 200, got 0
```

---

## Test Data Flow Diagram

```
Client Submission Form
        ↓
API Endpoint: /api/submit
        ↓
Server Validation
        ↓
Database Storage (MongoDB/SQLite)
        ↓
API Endpoint: /api/orders
        ↓
Owner Dashboard Retrieval
        ↓
Display & Management (Edit/Delete)
```

---

## Report Generation

Reports are automatically created in:
```
owner-railway/
├── test-reports/
│   ├── test-report-2026-06-20T10-30-45-123Z.html
│   ├── test-report-2026-06-20T10-30-45-123Z.json
│   ├── test-report-2026-06-20T14-15-30-456Z.html
│   └── test-report-2026-06-20T14-15-30-456Z.json
```

Each report includes:
- Timestamp of test run
- All test results with details
- Performance metrics
- Pass/fail statistics
- Error messages and stack traces

---

## Next Steps

1. ✅ Run initial tests to establish baseline
2. 📊 Review HTML report in browser
3. 🔧 Fix any failures identified
4. 🔄 Re-run tests to verify fixes
5. 📈 Schedule automated test runs
6. 📧 Share reports with team

---

## Support & Debugging

### Viewing Detailed Logs
Check browser developer console when running tests:
1. Open DevTools (F12)
2. Go to Network tab
3. Run tests and observe requests/responses
4. Check Console tab for any JavaScript errors

### Checking Server Logs
```bash
# Terminal where server is running should show:
Server listening on port 3000
GET /api/orders 200 45ms
POST /api/submit 201 32ms
```

### Database Verification
```bash
# Check submissions were saved
# For SQLite: Check submissions.db file
# For MongoDB: Use MongoDB Compass or CLI
```

---

## Conclusion

This test suite ensures the Craveessa platform is:
- ✅ Properly connected between client and owner
- ✅ Reliably storing customer data
- ✅ Securely managing owner access
- ✅ Returning expected data formats
- ✅ Handling errors gracefully

Run tests regularly to catch issues early!
