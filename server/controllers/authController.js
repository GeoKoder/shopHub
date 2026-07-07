import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendTokenResponse } from '../utils/jwt.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to ShopHub!',
      html: emailTemplates.welcome(user.name)
    });
  } catch (error) {
    console.error('Welcome email failed:', error);
  }

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  // Check if email is being changed and if it already exists
  if (req.body.email && req.body.email !== req.user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: emailTemplates.passwordReset(user.name, resetUrl)
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  // If this is the first address or marked as default, make it default
  const isDefault = user.addresses.length === 0 || req.body.isDefault;
  
  // If setting as default, remove default from other addresses
  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push({ ...req.body, isDefault });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    addresses: user.addresses
  });
});

// @desc    Update address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  // If setting as default, remove default from other addresses
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    addresses: user.addresses
  });
});

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  address.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    addresses: user.addresses
  });
});