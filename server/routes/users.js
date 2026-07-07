import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Wishlist routes
router.post('/wishlist/:productId', validateObjectId('productId'), addToWishlist);
router.delete('/wishlist/:productId', validateObjectId('productId'), removeFromWishlist);
router.get('/wishlist', getWishlist);

// Admin only routes
router.use(admin);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', validateObjectId('id'), getUser);
router.put('/:id', validateObjectId('id'), updateUser);
router.delete('/:id', validateObjectId('id'), deleteUser);

export default router;