# Quick Test Setup

## 30-Second Setup

### 1. Terminal 1 - Start Server
```bash
cd owner-railway
npm start
```

### 2. Terminal 2 - Run Tests
```bash
cd owner-railway
npm test
```

### 3. View Report
Check the generated HTML report:
- Path: `owner-railway/test-reports/test-report-[timestamp].html`
- Open in any browser
- Share with team

---

## What Gets Tested

✅ **Can client connect to server?**
✅ **Can server accept submissions?**
✅ **Are submissions saved?**
✅ **Can owner add products?**
✅ **Can owner delete submissions?**
✅ **Are API responses correct?**
✅ **Are errors handled properly?**

---

## Expected Output

```
═══════════════════════════════════════════════════════════
CRAVEESSA - API INTEGRATION & CONNECTIVITY TEST SUITE
═══════════════════════════════════════════════════════════

📡 SECTION 1: CONNECTIVITY TESTS

✓ Server is running and responding
✓ Owner page is accessible
✓ Public directory is served
✓ CORS headers are present

🔐 SECTION 2: AUTHENTICATION TESTS

✓ Login endpoint is accessible
✓ Owner can login with valid credentials

... (more test results)

═══════════════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════════════
Total Tests: 18
✓ Passed:    16
✗ Failed:    0
⊘ Skipped:   2
⏱️  Duration:   2450ms
Pass Rate: 88.89%

📄 Test report saved to: .../test-reports/test-report-2026-06-20T...html
📊 JSON report saved to: .../test-reports/test-report-2026-06-20T...json
```

---

## Troubleshooting

### Tests Won't Connect?
```bash
# Check if server is actually running
curl http://localhost:3000
# Should return a response (not "Connection refused")
```

### Tests Fail Immediately?
1. Make sure server is running in Terminal 1
2. Check no firewall is blocking localhost:3000
3. Verify no other app is using port 3000

### Want to See More Details?
1. Open the generated HTML report
2. Check JSON report for structured data
3. Read the full TESTING_GUIDE.md

---

## That's It! 🎉

Your tests will now:
1. Check all connectivity
2. Test data flow
3. Verify data management
4. Generate beautiful reports

Reports are saved with timestamp - keep them for records!
