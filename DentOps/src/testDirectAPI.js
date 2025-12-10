// Test using direct HTTP request instead of SDK
const https = require('https');
require('dotenv').config({ path: __dirname + '/../.env' });

const API_KEY = process.env.GEMINI_API_KEY;

const data = JSON.stringify({
  contents: [{
    parts: [{
      text: "Expand these brief dental notes into professional documentation: cavity tooth 14, composite filling"
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: '/v1beta/models/gemini-2.0-flash:generateContent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'X-goog-api-key': API_KEY
  }
};

console.log('Testing direct HTTP call to Gemini API...');
console.log('API Key:', API_KEY?.substring(0, 20) + '...');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✅ Response received:');
    try {
      const json = JSON.parse(responseData);
      if (json.candidates && json.candidates[0].content.parts[0].text) {
        console.log('\n📝 Generated text:');
        console.log(json.candidates[0].content.parts[0].text);
      } else {
        console.log('Full response:', JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(data);
req.end();
