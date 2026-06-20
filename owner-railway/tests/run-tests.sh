#!/bin/bash
# Craveessa API Test Runner - Unix/Linux/Mac Script
# This script runs the comprehensive API test suite

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Craveessa API Integration Test Suite"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if server is running
echo "Checking if server is running on localhost:3000..."
sleep 2

# Run the test suite
echo ""
echo "Starting test suite..."
echo ""

node "$(dirname "$0")/api.test.js"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Tests completed successfully!"
    echo ""
    echo "Check the test-reports folder for detailed HTML and JSON reports."
    echo ""
else
    echo ""
    echo "✗ Tests encountered an error!"
    echo "Please check the error message above."
    echo ""
fi
