const Groq = require("groq-sdk");

GROQ_API_KEY = "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";

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function getGroqChatCompletion(prompt) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-8b-8192",
  });
}

module.exports = { getGroqChatCompletion };