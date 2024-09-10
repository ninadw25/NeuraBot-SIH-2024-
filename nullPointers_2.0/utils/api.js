const Groq = require("groq-sdk");

const GROQ_API_KEY = "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";

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function getGroqChatCompletion(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ], 
      model: "llama-3.1-8b-instant",
    });
    return completion;
  } catch (error) {  
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

module.exports = { getGroqChatCompletion };