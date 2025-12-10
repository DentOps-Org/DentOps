// Quick test script to verify Gemini API works
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try gemini-pro (works with free tier v1 API)
    console.log('\nTrying model: gemini-pro');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Log full error object properties
    console.error('\nAll error properties:');
    for (let key in error) {
      console.error(`  ${key}:`, error[key]);
    }
  }
}

testGeminiAPI().then(() => {
  console.log('\nTest complete.');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
