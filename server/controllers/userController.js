import User from '../models/User.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const user = await User.findById(req.user.id);

  // Check if product already in wishlist
  if (user.wishlist.includes(req.params.productId)) {
    return next(new AppError('Product already in wishlist', 400));
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    wishlist: user.wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if product in wishlist
  if (!user.wishlist.includes(req.params.productId)) {
    return next(new AppError('Product not in wishlist', 400));
  }

  user.wishlist = user.wishlist.filter(
    productId => productId.toString() !== req.params.productId
  );
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    wishlist: user.wishlist
  });
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'wishlist',
    match: { isActive: true },
    select: 'name price images rating reviewCount category stock'
  });

  res.status(200).json({
    success: true,
    wishlist: user.wishlist
  });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};
  
  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users
  });
});

// @desc    Get single user (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('wishlist', 'name price images');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Don't allow updating password through this route
  if (req.body.password) {
    delete req.body.password;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Don't allow admin to delete themselves
  if (user._id.toString() === req.user.id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const monthlyRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), 0, 1) // This year
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        registrations: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    totalUsers,
    stats,
    monthlyRegistrations
  });
});