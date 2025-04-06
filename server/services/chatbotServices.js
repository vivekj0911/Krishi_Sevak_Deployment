// server/services/chatbotService.js
const axios = require('axios');
const Field = require('../models/Field');
const User = require('../models/User');
const IrrigationLog = require('../models/IrrigationLog');
const { createEmbedding, searchVectorStore } = require('../utils/vectorStore');
const { loadDocuments } = require('../utils/documentLoader');
const mongoose = require('mongoose');

// Configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Initialize vector store with government documents
async function initializeVectorStore() {
  try {
    console.log('Initializing vector store with government documents...');
    const govDocs = await loadDocuments('./data/government_docs');
    
    // Create embeddings for each document and store them
    for (const doc of govDocs) {
      await createEmbedding(doc.id, doc.text, doc.metadata);
    }
    
    console.log('Vector store initialized successfully');
  } catch (error) {
    console.error('Error initializing vector store:', error);
  }
}

// Get farmer-specific data
async function getFarmerData(userId) {
  try {
    // Get user information
    const user = await User.findById(userId);
    
    // Get field information
    const fields = await Field.find({ user: userId });
    
    // Get irrigation logs
    const irrigationLogs = await IrrigationLog.find({ 
      field: { $in: fields.map(field => field._id) }
    }).sort({ date: -1 }).limit(10);
    
    // Format the data
    const farmerData = {
      name: user.name,
      fields: fields.map(field => ({
        id: field._id,
        name: field.name,
        size: field.size,
        crop: field.currentCrop,
        soilType: field.soilType,
        location: field.location,
        lastIrrigated: field.lastIrrigated,
        plantingDate: field.plantingDate,
      })),
      irrigationHistory: irrigationLogs.map(log => ({
        date: log.date,
        field: log.field,
        duration: log.duration,
        amount: log.amount,
        notes: log.notes,
      }))
    };
    
    return farmerData;
  } catch (error) {
    console.error('Error fetching farmer data:', error);
    throw new Error('Failed to fetch farmer data');
  }
}

// Generate system prompt with context
function generateSystemPrompt(farmerData) {
  return `You are AgriBot, a specialized agricultural assistant helping farmers manage their farms and crops. 
You have access to the following information about the farmer:

Farmer: ${farmerData.name}
Fields: ${JSON.stringify(farmerData.fields, null, 2)}
Recent Irrigation History: ${JSON.stringify(farmerData.irrigationHistory, null, 2)}

When responding to the farmer:
1. Be practical and specific, providing actionable advice based on their actual farm data
2. Use simple language and avoid technical jargon
3. Consider local agricultural practices and constraints
4. When appropriate, suggest sustainable farming practices
5. If you don't know something specific, acknowledge it clearly
6. Format your responses for easy reading on mobile devices

Your goal is to help improve farm productivity, sustainability, and the farmer's livelihood.`;
}

// Process farmer query using RAG and DeepSeek LLM
async function processFarmerQuery(userId, query) {
  try {
    // Get farmer-specific data
    const farmerData = await getFarmerData(userId);
    
    // Search vector store for relevant information
    const relevantDocs = await searchVectorStore(query, 3);
    
    // Format the retrieved documents as context
    const retrievedContext = relevantDocs.map(doc => 
      `Source: ${doc.metadata.source}\n${doc.text}`
    ).join('\n\n');
    
    // Generate system prompt
    const systemPrompt = generateSystemPrompt(farmerData);
    
    // Prepare the API request
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `
I need information about the following query: ${query}

Here's some relevant information that might help:
${retrievedContext}

Please provide a helpful, accurate, and practical response based on this information and your knowledge about agriculture.
` }
    ];
    
    // Call DeepSeek API
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return the response
    return {
      response: response.data.choices[0].message.content,
      sources: relevantDocs.map(doc => doc.metadata.source)
    };
  } catch (error) {
    console.error('Error processing farmer query:', error);
    throw new Error('Failed to process your query. Please try again later.');
  }
}

// Log conversation for improving the system
async function logConversation(userId, query, response) {
  // Implementation for logging conversations
  // This would typically store the conversation in a database
  // for future analysis and improvement
}

module.exports = {
  initializeVectorStore,
  processFarmerQuery,
  logConversation
};