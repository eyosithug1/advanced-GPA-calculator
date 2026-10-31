import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc   Update user profile
// @route  PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, university, major, gradeScale, settings, targetGPA } = req.body;

  if (name) user.name = name;
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = email;
  }
  if (university !== undefined) user.university = university;
  if (major !== undefined) user.major = major;
  if (gradeScale) user.gradeScale = gradeScale;
  if (settings) user.settings = { ...user.settings, ...settings };
  if (targetGPA !== undefined) user.targetGPA = targetGPA;

  // Handle password change
  if (req.body.password) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Current password is required to change password');
    }
    const userWithPw = await User.findById(req.user._id).select('+password');
    const isMatch = await userWithPw.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      university: updatedUser.university,
      major: updatedUser.major,
      gradeScale: updatedUser.gradeScale,
      settings: updatedUser.settings,
      targetGPA: updatedUser.targetGPA,
      initials: updatedUser.initials,
      updatedAt: updatedUser.updatedAt
    }
  });
});

// @desc   Delete user account
// @route  DELETE /api/users/profile
// @access Private
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!req.body.password) {
    res.status(400);
    throw new Error('Password is required to delete account');
  }

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) {
    res.status(400);
    throw new Error('Incorrect password');
  }

  // Soft delete
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Account deleted successfully' });
});
