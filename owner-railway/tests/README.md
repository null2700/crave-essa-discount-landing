# Craveessa API Test Suite

Comprehensive test suite for API connectivity and data management between client and owner sites.

## Test Coverage

### 1. **Connectivity Tests** 📡
- Server availability and response
- Owner page accessibility
- Public directory serving
- CORS headers validation

### 2. **Authentication Tests** 🔐
- Login endpoint availability
- Owner credential validation
- Session management

### 3. **Client Submission Tests** 📋
- Form data submission from client
- Submission retrieval via API
- Batch submission creation
- Data validation

### 4. **Owner Data Management Tests** 📦
- Product creation/addition
- Product listing
- Product deletion
- Data persistence

### 5. **Data Retrieval Tests** 📊
- Orders endpoint format validation
- Products endpoint format validation
- Data structure integrity

### 6. **Error Handling Tests** ⚠️
- Invalid endpoint handling
- Missing field validation
- Invalid ID error handling

## Running Tests

### Prerequisites
```bash
# Make sure the server is running
cd owner-railway
npm start
# Server will run on http://localhost:3000
```

### Run Tests
```bash
# In a new terminal, from the owner-railway directory
node tests/api.test.js
```

### Output
The test suite generates:
1. **Console Output** - Real-time test progress and summary
2. **HTML Report** - Beautiful visual report at `test-reports/test-report-[timestamp].html`
3. **JSON Report** - Machine-readable report at `test-reports/test-report-[timestamp].json`

## Test Configuration

Edit `TEST_CONFIG` in `api.test.js` to customize:
- Server URL (default: `http://localhost:3000`)
- Owner credentials
- Test data (submissions, products)

## Expected Results

### Successful Run
```
✓ Server is running and responding
✓ Owner page is accessible
✓ Public directory is served
✓ CORS headers are present
...
═══════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════
Total Tests: 18
✓ Passed:    16
✗ Failed:    0
⊘ Skipped:   2
⏱️  Duration:   2450ms
Pass Rate: 88.89%
```

## Test Scenarios

### Scenario 1: Basic Connectivity
Verifies that all endpoints are accessible and responding correctly.

### Scenario 2: Data Flow
Tests the complete flow from client submission → owner retrieval → owner management.

### Scenario 3: Product Management
Tests adding, retrieving, and deleting products from the owner dashboard.

### Scenario 4: Submission Handling
Tests client submission creation, retrieval, and deletion.

### Scenario 5: Error Cases
Validates proper error handling for invalid inputs and missing data.

## Report Interpretation

### HTML Report Features
- **Metrics Dashboard** - Quick overview of pass/fail/skip counts
- **Progress Bar** - Visual representation of pass rate
- **Detailed Results** - Each test with status, error details (if any), and duration
- **Color Coding**
  - 🟢 Green: Passed tests
  - 🔴 Red: Failed tests
  - 🟡 Yellow: Skipped tests

### JSON Report Structure
```json
{
  "passed": 16,
  "failed": 0,
  "skipped": 2,
  "tests": [
    {
      "name": "Test name",
      "status": "passed|failed|skipped",
      "error": "Error message if failed",
      "duration": 123
    }
  ],
  "startTime": 1234567890,
  "endTime": 1234567990
}
```

## Troubleshooting

### Tests Fail to Connect
- Ensure server is running on `http://localhost:3000`
- Check firewall settings
- Verify no other process is using port 3000

### Authentication Tests Fail
- Create owner account first: Access `/owner` and create account
- Update `TEST_CONFIG.ownerUsername` and `ownerPassword` in test file
- Ensure owner credentials are correct

### Data Tests Show Missing Fields
- This is expected on first run
- Tests can create test data but may need valid owner session
- Check HTML report for detailed error messages

## Automated Testing

### For CI/CD Integration
```bash
# Run tests and fail if any test fails
node tests/api.test.js && echo "All tests passed!"
```

### With Custom Timeout
```javascript
// Edit api.test.js to add timeout handling
const timeout = 30000; // 30 seconds
// Add to makeRequest function
```

## Next Steps

1. ✅ Run initial tests to establish baseline
2. 📊 Review HTML report for any failures
3. 🔧 Fix issues identified in tests
4. 🔄 Re-run tests to verify fixes
5. 📈 Schedule regular test runs

## Support

For test issues or enhancements, check:
- Console output for detailed error messages
- HTML report for visual debugging
- Server logs for backend errors
