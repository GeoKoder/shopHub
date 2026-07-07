import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('No order items provided', 400));
  }

  // Verify products exist and have sufficient stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Product not found: ${item.name}`, 404));
    }
    
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
    }
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: paymentInfo.status === 'succeeded' ? Date.now() : undefined
  });

  // Update product stock and sold count
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: -item.quantity,
        sold: item.quantity
      }
    });
  }

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: 'Order Confirmation - ShopHub',
      html: emailTemplates.orderConfirmation(
        req.user.name,
        order._id.toString().slice(-6).toUpperCase(),
        totalPrice.toFixed(2)
      )
    });
  } catch (error) {
    console.error('Order confirmation email failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('orderItems.product', 'name images');

  const total = await Order.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order or is admin
  if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  // Handle status-specific logic
  if (status === 'cancelled' && order.orderStatus !== 'pending') {
    return next(new AppError('Only pending orders can be cancelled', 400));
  }

  if (status === 'cancelled') {
    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity
        }
      });
    }
  }

  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  order.orderStatus = status;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};
  
  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name');

  const total = await Order.countDocuments(query);

  // Calculate statistics
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    orders,
    stats: stats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Only allow deletion of cancelled orders
  if (order.orderStatus !== 'cancelled') {
    return next(new AppError('Only cancelled orders can be deleted', 400));
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const monthlyStats = await Order.aggregate([
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
        orders: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    stats,
    monthlyStats
  });
});