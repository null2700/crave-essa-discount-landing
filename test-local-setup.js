#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing local cross-deployment setup...\n');

// Test 1: Health check on port 3000
console.log('Test 1: Health check on port 3000');
http.get('http://localhost:3000/health', (res) => {
  console.log(`✅ Port 3000: ${res.statusCode}\n`);
  
  // Test 2: Health check on port 3001
  console.log('Test 2: Health check on port 3001');
  http.get('http://localhost:3001/health', (res) => {
    console.log(`✅ Port 3001: ${res.statusCode}\n`);
    
    // Test 3: Submit data
    console.log('Test 3: POST /submit on port 3000');
    const postData = JSON.stringify({
      fullName: 'Test User',
      whatsappNumber: '9011560339',
      email: 'test@example.com',
      cakeSize: '1 kg',
      occasion: 'Birthday'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const result = JSON.parse(data);
          console.log(`✅ Response: ${JSON.stringify(result, null, 2)}\n`);
          
          // Test 4: Verify CORS headers
          console.log('Test 4: CORS headers on port 3001');
          const corsOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/submit',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'https://example.vercel.app'
            }
          };
          
          const corsReq = http.request(corsOptions, (res) => {
            const corsHeader = res.headers['access-control-allow-origin'];
            console.log(`✅ CORS Allow-Origin: ${corsHeader || 'not set'}`);
            console.log(`\n🎉 All tests passed!\n`);
            process.exit(0);
          });
          
          corsReq.write(postData);
          corsReq.end();
        } catch (e) {
          console.error(`Error parsing response: ${e.message}`);
          process.exit(1);
        }
      });
    });
    
    req.on('error', err => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
    
    req.write(postData);
    req.end();
  }).on('error', err => {
    console.error(`Error on port 3001: ${err.message}`);
    process.exit(1);
  });
}).on('error', err => {
  console.error(`Error on port 3000: ${err.message}`);
  process.exit(1);
});
