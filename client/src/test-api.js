import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.VITE_GEMINI_API_KEY || "AIzaSyA4VC2pzB7gS3VW96npOVYjTYbsazkaaOw";

async function testApiKey() {
  try {
    console.log("Testing API key...");
    console.log("API Key:", API_KEY);
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // List available models
    const models = await genAI.listModels();
    console.log("Available models:", models);
    
    // Try to use a model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Hello, how are you?");
    const response = await result.response;
    console.log("Response:", response.text());
    
    console.log("API key is valid!");
  } catch (error) {
    console.error("Error testing API key:", error);
  }
}

testApiKey(); 