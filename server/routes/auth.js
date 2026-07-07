import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { 
  validateRegister, 
  validateLogin,
  validateObjectId 
} from '../middleware/validation.js';
import { authLimiter, passwordResetLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

// Address management
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', validateObjectId('addressId'), updateAddress);
router.delete('/addresses/:addressId', validateObjectId('addressId'), deleteAddress);

export default router;