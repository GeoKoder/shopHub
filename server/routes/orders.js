import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';
import { validateOrder, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/', validateOrder, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', validateObjectId('id'), getOrder);

// Admin only routes
router.use(admin);

router.get('/', getAllOrders);
router.get('/stats/overview', getOrderStats);
router.put('/:id/status', validateObjectId('id'), updateOrderStatus);
router.delete('/:id', validateObjectId('id'), deleteOrder);

export default router;