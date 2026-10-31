import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, university, major } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    university: university || '',
    major: major || ''
  });

  if (user) {
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        major: user.major,
        gradeScale: user.gradeScale,
        settings: user.settings,
        targetGPA: user.targetGPA,
        initials: user.initials,
        createdAt: user.createdAt,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account has been deactivated. Contact support.');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      major: user.major,
      gradeScale: user.gradeScale,
      settings: user.settings,
      targetGPA: user.targetGPA,
      initials: user.initials,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      token: generateToken(user._id)
    }
  });
});

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      major: user.major,
      gradeScale: user.gradeScale,
      settings: user.settings,
      targetGPA: user.targetGPA,
      initials: user.initials,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

// @desc   Logout (client side - just returns success)
// @route  POST /api/auth/logout
// @access Private
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
