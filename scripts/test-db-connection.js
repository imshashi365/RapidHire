// Simple script to test MongoDB connection
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  // Get the connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  // Create a new MongoClient
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Get the database
    const db = client.db();
    
    // Test the connection with a simple command
    const result = await db.command({ ping: 1 });
    console.log('Ping command result:', result);
    
    // List all collections to verify access
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return { success: true, collections: collections.map(c => c.name) };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testConnection()
  .then(result => {
    console.log('Test completed with result:', result);
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
