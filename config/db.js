import mongoose from 'mongoose';

/**
 * Establish connection to the MongoDB database.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_attendance';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`
    🔋 MongoDB Connected: ${conn.connection.host}
    📂 Database Name: ${conn.connection.name}
    `);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
