const fs = require('fs');
const path = require('path');
const { getGroqChatCompletion } = require('../utils/api');

const chatHandler = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Read the content of the uploaded document
        const filePath = path.join(__dirname, '../uploads/document.txt');
        let context = '';
        
        if (fs.existsSync(filePath)) {
            context = fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn('document.txt not found. Using empty context.');
        }

        // Prepare the prompt
        const fullPrompt = `Based on the following context, answer the question. If the answer cannot be found in the context, say so:\n\nContext: ${context}\n\nQuestion: ${message}`;

        // Get response from Groq
        const completion = await getGroqChatCompletion(fullPrompt);
        const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

        res.json({ response });
    } catch (error) {
        console.error('Error in chat handler:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

module.exports = { chatHandler };