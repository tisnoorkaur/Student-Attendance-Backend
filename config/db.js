import mongoose from 'mongoose';
import { User } from '../models/User.js';

/**
 * Establish connection to the MongoDB database.
 */
let isConnected = false;

async function seedDefaultUsers() {
  try {
    // Admin check is always performed to ensure admin/admin is set
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('🌱 Seeding admin user...');
      admin = new User({
        username: 'admin',
        password: 'admin',
        role: 'admin',
        schoolName: 'System Administrator',
      });
      await admin.save();
    } else {
      const isMatch = await admin.comparePassword('admin');
      if (!isMatch) {
        console.log('🔄 Enforcing admin/admin credentials...');
        admin.password = 'admin';
        await admin.save();
      }
    }

    const userCount = await User.countDocuments();
    if (userCount <= 1) {
      console.log('🌱 Seeding default school users...');
      
      // School 1
      const school1 = new User({
        username: 'school1',
        password: 'schoolpassword',
        role: 'school',
        schoolName: 'Greenwood High School',
      });
      await school1.save();

      // School 2
      const school2 = new User({
        username: 'school2',
        password: 'schoolpassword',
        role: 'school',
        schoolName: 'Riverside Academy',
      });
      await school2.save();

      console.log('✅ Default users seeded successfully!');
    }
  } catch (err) {
    console.error('⚠️ Failed to seed default users:', err.message);
  }
}

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
    
    // Seed default users
    await seedDefaultUsers();
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

