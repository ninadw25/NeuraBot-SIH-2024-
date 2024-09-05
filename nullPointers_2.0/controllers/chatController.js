const fs = require('fs');
const path = require('path');
const { getGroqChatCompletion } = require('../utils/api.js');

exports.handleChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    const context = fs.readFileSync(path.resolve('./assets/documents/document.txt'), 'utf-8');
    
    const fullPrompt = `Based on the following context, answer the question without providing information outside of it:\n${context}\n\nQuestion: ${prompt}`;
    
    const chatCompletion = await getGroqChatCompletion(fullPrompt);
    const response = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    
    res.json({ response });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};