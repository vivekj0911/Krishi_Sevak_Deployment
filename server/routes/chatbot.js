// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const { processFarmerQuery, logConversation } = require('../services/chatbotService');
const auth = require('../middleware/auth');

// Initialize chatbot on server start
const { initializeVectorStore } = require('../services/chatbotService');
const { initVectorStore } = require('../utils/vectorStore');

// Initialize the system
(async () => {
  try {
    await initVectorStore();
    await initializeVectorStore();
    console.log('Chatbot system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize chatbot system:', error);
  }
})();

// Handle farmer queries
router.post('/query', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Process the query
    const response = await processFarmerQuery(userId, query);
    
    // Log the conversation for improvement
    await logConversation(userId, query, response);
    
    res.json(response);
  } catch (error) {
    console.error('Error in chatbot query:', error);
    res.status(500).json({ error: 'Failed to process your query' });
  }
});

// Get conversation history
router.get('/history', auth, async (req, res) => {
  try {
    // Implementation for fetching conversation history
    // This would typically retrieve conversations from the database
    res.json({ message: 'History endpoint not implemented yet' });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

module.exports = router;