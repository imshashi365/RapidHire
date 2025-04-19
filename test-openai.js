require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Try with gpt-3.5-turbo which is more widely available
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
      max_tokens: 10
    });
    
    console.log('OpenAI API is working! Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    
    // Try to get available models
    try {
      console.log('Attempting to list available models...');
      const models = await openai.models.list();
      console.log('Available models:', models.data.map(model => model.id).join(', '));
    } catch (modelError) {
      console.error('Error listing models:', modelError.message);
    }
  }
}

testOpenAI(); 