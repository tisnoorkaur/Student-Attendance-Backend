import mongoose from 'mongoose';

/**
 * Establish connection to the MongoDB database.
 */
let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set! Using localhost fallback.');
  }

  try {
    const db = await mongoose.connect(uri || 'mongodb://localhost:27017/student_attendance', {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`
    🔋 MongoDB Connected: ${db.connection.host}
    📂 Database Name: ${db.connection.name}
    `);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // Don't exit process in serverless, let the route handler fail or retry next time
  }
}
