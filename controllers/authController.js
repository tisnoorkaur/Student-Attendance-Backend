import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      console.log('Login failed: user not found for username:', username);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Login attempt:', username, 'User role:', user.role, 'Password matches:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret-jwt-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          username: user.username,
          role: user.role,
          schoolName: user.schoolName,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function register(req, res) {
  try {
    const { username, password, schoolName, role } = req.body;
    if (!username || !password || !schoolName) {
      return res.status(400).json({ success: false, message: 'Username, password, and school name are required' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const newUser = new User({
      username: username.toLowerCase().trim(),
      password,
      schoolName: schoolName.trim(),
      role: 'school',
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        username: newUser.username,
        role: newUser.role,
        schoolName: newUser.schoolName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    res.json({
      success: true,
      data: {
        username: req.user.username,
        role: req.user.role,
        schoolName: req.user.schoolName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSchools(req, res) {
  try {
    const schools = await User.find({ role: 'school' }).select('-password').sort({ schoolName: 1 });
    res.json({ success: true, data: schools });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteSchool(req, res) {
  try {
    const { username } = req.params;
    if (username === req.user.username) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    const result = await User.deleteOne({ username: username.toLowerCase().trim(), role: 'school' });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'School user not found' });
    }
    res.json({ success: true, message: 'School user deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
