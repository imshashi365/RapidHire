const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function createTestInterview() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    
    // First, create a test user if not exists
    let user = await db.collection("users").findOne({
      email: "test@example.com"
    });
    
    if (!user) {
      console.log("Creating test user...");
      const result = await db.collection("users").insertOne({
        email: "test@example.com",
        name: "Test User",
        role: "candidate",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      user = {
        _id: result.insertedId
      };
      console.log("Created test user:", user._id.toString());
    } else {
      console.log("Found existing user:", user._id.toString());
    }
    
    // Create a test position
    const position = await db.collection("positions").insertOne({
      title: "Software Engineer",
      description: "Test position for software engineering",
      requirements: "Test requirements",
      companyName: "Test Company",
      department: "Engineering",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Created test position:", position.insertedId.toString());
    
    // Create a test interview
    const interview = await db.collection("interviews").insertOne({
      positionId: position.insertedId,
      userId: user._id,
      status: "scheduled",
      isStarted: false,
      currentQuestion: "",
      questionNumber: 0,
      transcript: "",
      aiResponse: "",
      score: null,
      feedback: null,
      startedAt: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("Created test interview:", interview.insertedId.toString());
  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

createTestInterview(); 