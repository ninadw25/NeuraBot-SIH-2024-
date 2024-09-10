const fs = require('fs');
const path = require('path');
const { getGroqChatCompletion } = require('../utils/api.js');
const chats = require('../models/chats.js');

// Handle the chat with memory
exports.handleChat = async (req, res) => {
  try {
    const { prompt } = req.body;

    await chats.create({
      prompt: prompt
    });
    
    // Check if conversation history exists in session; if not, initialize it
    if (!req.session.conversationHistory) {
      req.session.conversationHistory = [];
    }

    const context = fs.readFileSync(path.resolve('./assets/documents/document.txt'), 'utf-8');

    // Compile previous conversation history to include in the prompt
    const previousMessages = req.session.conversationHistory.map((entry) => {
      return `User: ${entry.prompt}\nAssistant: ${entry.response}`;
    }).join("\n");

    // Full prompt that is supposed to be send to the model
    const fullPrompt = `
    ${context}

    ${previousMessages}

    You are an AI assistant. Respond to the user's question only if it is within the provided information above. If the question is unrelated or inappropriate, respond politely and remind the user to ask questions relevant to the provided information. If the user greets you, respond with a friendly greeting as a human would. Always remain courteous and avoid offensive language. If the user uses offensive language, politely ask them to be appropriate. If the user asks to answer in any language do so for that message only not the upcoming ones.

    Question: ${prompt}
    `;

    const chatCompletion = await getGroqChatCompletion(fullPrompt);
    const response = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Store the current prompt and response in the session history
    req.session.conversationHistory.push({ prompt, response });

    res.json({ response });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

// Route to clear the chat session memory
exports.clearChatSession = (req, res) => {
  try {
    req.session.conversationHistory = []; // Clear conversation history
    res.status(200).json({ message: "Chat session cleared." });
  } catch (error) {
    console.error('Error clearing chat session:', error);
    res.status(500).json({ error: 'An error occurred while clearing the chat session.' });
  }
};
