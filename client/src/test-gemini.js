import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read the .env file
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    envVars[key.trim()] = value.trim();
  }
});

// Get the API key
const API_KEY = envVars.VITE_GEMINI_API_KEY;
console.log('API Key:', API_KEY);

async function testGemini() {
  try {
    console.log('Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const modelNames = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, how are you?');
        const response = await result.response;
        console.log(`Response with ${modelName}:`, response.text());
        console.log(`Model ${modelName} works!`);
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error.message);
      }
    }
    
    console.log('Test completed!');
  } catch (error) {
    console.error('Error testing Gemini:', error);
  }
}

testGemini(); 