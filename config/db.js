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
      let updated = false;
      if (!isMatch) {
        console.log('🔄 Enforcing admin/admin password...');
        admin.password = 'admin';
        updated = true;
      }
      if (admin.role !== 'admin') {
        console.log('🔄 Enforcing admin role on admin account...');
        admin.role = 'admin';
        updated = true;
      }
      if (admin.schoolName !== 'System Administrator') {
        admin.schoolName = 'System Administrator';
        updated = true;
      }
      if (updated) {
        await admin.save();
      }
    }

    // School 1
    let school1 = await User.findOne({ username: 'school1' });
    if (!school1) {
      console.log('🌱 Seeding school1...');
      school1 = new User({
        username: 'school1',
        password: 'schoolpassword',
        role: 'school',
        schoolName: 'Greenwood High School',
      });
      await school1.save();
    } else {
      const isMatch = await school1.comparePassword('schoolpassword');
      let updated = false;
      if (!isMatch) {
        console.log('🔄 Enforcing school1 password...');
        school1.password = 'schoolpassword';
        updated = true;
      }
      if (school1.role !== 'school') {
        school1.role = 'school';
        updated = true;
      }
      if (updated) {
        await school1.save();
      }
    }

    // School 2
    let school2 = await User.findOne({ username: 'school2' });
    if (!school2) {
      console.log('🌱 Seeding school2...');
      school2 = new User({
        username: 'school2',
        password: 'schoolpassword',
        role: 'school',
        schoolName: 'Riverside Academy',
      });
      await school2.save();
    } else {
      const isMatch = await school2.comparePassword('schoolpassword');
      let updated = false;
      if (!isMatch) {
        console.log('🔄 Enforcing school2 password...');
        school2.password = 'schoolpassword';
        updated = true;
      }
      if (school2.role !== 'school') {
        school2.role = 'school';
        updated = true;
      }
      if (updated) {
        await school2.save();
      }
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

