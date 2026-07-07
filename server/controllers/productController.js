import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { uploadMultipleImages, deleteMultipleImages } from '../utils/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query
  let query = { isActive: true };

  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filter
  if (req.query.category && req.query.category !== 'All') {
    query.category = req.query.category;
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }

  // Featured filter
  if (req.query.featured === 'true') {
    query.featured = true;
  }

  // In stock filter
  if (req.query.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Build sort
  let sort = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    sort.createdAt = -1; // Default sort by newest
  }

  // Execute query
  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name');

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('reviews.user', 'name avatar');

  if (!product || !product.isActive) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const images = await uploadMultipleImages(req.files, 'products');
    req.body.images = images;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images if replacing
    if (req.body.replaceImages === 'true' && product.images.length > 0) {
      const publicIds = product.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    const newImages = await uploadMultipleImages(req.files, 'products');
    
    if (req.body.replaceImages === 'true') {
      req.body.images = newImages;
    } else {
      req.body.images = [...product.images, ...newImages];
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Delete images from Cloudinary
  if (product.images.length > 0) {
    const publicIds = product.images.map(img => img.public_id);
    await deleteMultipleImages(publicIds);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === req.user.id.toString()
  );

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully'
  });
});

// @desc    Update product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user.id.toString()) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  review.rating = req.body.rating || review.rating;
  review.comment = req.body.comment || review.comment;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Review updated successfully'
  });
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  review.deleteOne();
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    categories
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ 
    featured: true, 
    isActive: true,
    stock: { $gt: 0 }
  })
    .sort({ rating: -1, sold: -1 })
    .limit(limit)
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const limit = parseInt(req.query.limit) || 4;

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true
  })
    .sort({ rating: -1 })
    .limit(limit)
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    products: relatedProducts
  });
});