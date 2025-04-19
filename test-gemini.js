require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testGemini() {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate content
    const prompt = "Hello, how are you?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Prompt:', prompt);
    console.log('Gemini API Response:', response.text());
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    if (error.message && error.message.includes('API key')) {
      console.log('Please check if your GOOGLE_API_KEY environment variable is set correctly.');
    }
  }
}

// Run the test
testGemini(); 