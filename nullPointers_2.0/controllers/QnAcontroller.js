const fs = require('fs');
const path = require('path');
const { getGroqChatCompletion } = require('../utils/api');

const chatHandler = async (req, res) => {
    console.log('Received chat request');
    try {
        const { message } = req.body;
        console.log('Received message:', message);
        
        // Read the content of the uploaded document
        const filePath = path.join(__dirname, '../uploads/document.txt');
        console.log('Attempting to read file:', filePath);
        let context = '';
        
        if (fs.existsSync(filePath)) {
            context = fs.readFileSync(filePath, 'utf8');
            console.log('File read successfully');
        } else {
            console.warn('document.txt not found. Using empty context.');
        }

        // Prepare the prompt
        const fullPrompt = `Based on the following context, answer the question. If the answer cannot be found in the context, say so:\n\nContext: ${context}\n\nQuestion: ${message}`;
        console.log('Prepared prompt:', fullPrompt);

        // Get response from Groq
        console.log('Calling Groq API...');
        const completion = await getGroqChatCompletion(fullPrompt);
        console.log('Received response from Groq API');
        const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        console.log('Sending response to client:', response);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat handler:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = { chatHandler };