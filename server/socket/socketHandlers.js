import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Store connected users
const connectedUsers = new Map();

// Socket authentication middleware
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Handle socket connections
export const handleConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join admin users to admin room
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    // Handle real-time events
    handleInventoryUpdates(socket, io);
    handleOrderUpdates(socket, io);
    handleNotifications(socket, io);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

// Handle inventory updates
const handleInventoryUpdates = (socket, io) => {
  socket.on('subscribe_product', (productId) => {
    socket.join(`product_${productId}`);
  });

  socket.on('unsubscribe_product', (productId) => {
    socket.leave(`product_${productId}`);
  });
};

// Handle order updates
const handleOrderUpdates = (socket, io) => {
  socket.on('subscribe_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('unsubscribe_order', (orderId) => {
    socket.leave(`order_${orderId}`);
  });
};

// Handle notifications
const handleNotifications = (socket, io) => {
  socket.on('mark_notification_read', (notificationId) => {
    // Handle marking notification as read
    socket.emit('notification_marked_read', { notificationId });
  });
};

// Emit events to specific users or rooms
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitToAdmins = (io, event, data) => {
  io.to('admin_room').emit(event, data);
};

export const emitToProduct = (io, productId, event, data) => {
  io.to(`product_${productId}`).emit(event, data);
};

export const emitToOrder = (io, orderId, event, data) => {
  io.to(`order_${orderId}`).emit(event, data);
};

// Broadcast inventory updates
export const broadcastInventoryUpdate = (io, productId, stock) => {
  emitToProduct(io, productId, 'inventory_update', {
    productId,
    stock,
    timestamp: new Date()
  });
};

// Broadcast order status updates
export const broadcastOrderUpdate = (io, orderId, status, userId) => {
  emitToOrder(io, orderId, 'order_status_update', {
    orderId,
    status,
    timestamp: new Date()
  });
  
  emitToUser(io, userId, 'order_update', {
    orderId,
    status,
    message: `Your order status has been updated to: ${status}`,
    timestamp: new Date()
  });
};

// Broadcast new order to admins
export const broadcastNewOrder = (io, order) => {
  emitToAdmins(io, 'new_order', {
    orderId: order._id,
    customerName: order.user.name,
    totalPrice: order.totalPrice,
    timestamp: new Date()
  });
};

export { connectedUsers };