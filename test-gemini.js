require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
    
    // Test prompt with our exact required format
    const prompt = `You are an AI expert at evaluating job interviews with a very strict evaluation criteria. Analyze this interview conversation and provide feedback in the following exact JSON format (no markdown formatting):
{
  "feedback": {
    "rating": {
      "technicalSkills": <number between 0-100>,
      "communication": <number between 0-100>,
      "problemSolving": <number between 0-100>,
      "experience": <number between 0-100>
    },
    "summary": "<concise 3-line summary>",
    "recommendation": "<Yes/No>",
    "recommendationMsg": "<brief reason>"
  }
}

Interview Conversation:
Candidate: I have 5 years of experience in React and Node.js.
Interviewer: Can you explain how you handle state management in React?
Candidate: I primarily use Redux for complex state management. For simpler components, I rely on React's built-in useState and useContext hooks. I also follow the principle of lifting state up when needed.`;
    
    console.log('Sending request to Gemini API...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw response received:');
    console.log(text);
    
    // Clean up the response text
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log('\nCleaned response:');
    console.log(cleanedText);
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(cleanedText);
      console.log('\nParsed JSON response:');
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      // Validate the response format
      const { feedback } = jsonResponse;
      if (!feedback) throw new Error('Missing feedback object');
      if (!feedback.rating) throw new Error('Missing rating object');
      if (!feedback.summary) throw new Error('Missing summary');
      if (!feedback.recommendation) throw new Error('Missing recommendation');
      if (!feedback.recommendationMsg) throw new Error('Missing recommendationMsg');
      
      const { rating } = feedback;
      ['technicalSkills', 'communication', 'problemSolving', 'experience'].forEach(field => {
        if (typeof rating[field] !== 'number' || rating[field] < 0 || rating[field] > 100) {
          throw new Error(`Invalid ${field} rating: ${rating[field]}`);
        }
      });
      
      console.log('\nResponse format is valid!');
    } catch (parseError) {
      console.log('\nResponse validation error:', parseError.message);
    }
    
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    if (error.message && error.message.includes('API key')) {
      console.log('Please check if your GOOGLE_API_KEY environment variable is set correctly.');
    }
  }
}

// Run the test
testGemini(); 