const { GoogleGenAI } = require("@google/genai");

let aiInstance = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey
    });
  }
  return aiInstance;
}

module.exports = {
  getGeminiClient
};

