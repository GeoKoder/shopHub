import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  updateReview,
  deleteReview,
  getCategories,
  getFeaturedProducts,
  getRelatedProducts
} from '../controllers/productController.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';
import { 
  validateProduct, 
  validateReview, 
  validateObjectId,
  validateQuery 
} from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', validateQuery, optionalAuth, getProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/:id', validateObjectId('id'), getProduct);
router.get('/:id/related', validateObjectId('id'), getRelatedProducts);

// Protected routes
router.use(protect);

// Review routes
router.post('/:id/reviews', validateObjectId('id'), validateReview, addReview);
router.put('/:id/reviews/:reviewId', 
  validateObjectId('id'), 
  validateObjectId('reviewId'), 
  validateReview, 
  updateReview
);
router.delete('/:id/reviews/:reviewId', 
  validateObjectId('id'), 
  validateObjectId('reviewId'), 
  deleteReview
);

// Admin only routes
router.use(admin);

router.post('/', upload.array('images', 5), validateProduct, createProduct);
router.put('/:id', validateObjectId('id'), upload.array('images', 5), updateProduct);
router.delete('/:id', validateObjectId('id'), deleteProduct);

export default router;