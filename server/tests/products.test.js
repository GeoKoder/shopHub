import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test';

describe('Product Endpoints', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let productId;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create regular user
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123'
    });
    await user.save();
    userId = user._id;

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin'
    });
    await admin.save();
    adminId = admin._id;

    // Get tokens
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'Password123' });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123' });
    adminToken = adminLogin.body.token;

    // Create test product
    const product = new Product({
      name: 'Test Product',
      description: 'This is a test product description',
      price: 99.99,
      category: 'Electronics',
      stock: 10,
      images: [{
        public_id: 'test_id',
        url: 'https://example.com/image.jpg'
      }],
      createdBy: adminId
    });
    await product.save();
    productId = product._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Test Product');
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(1);
    });

    it('should filter products by price range', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=50&maxPrice=150')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(1);
    });

    it('should search products', async () => {
      const res = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.products).toHaveLength(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get single product', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe('Test Product');
      expect(res.body.product._id).toBe(productId.toString());
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const productData = {
        name: 'New Product',
        description: 'This is a new product description',
        price: 149.99,
        category: 'Clothing',
        stock: 5
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.product.name).toBe(productData.name);
      expect(res.body.product.createdBy).toBe(adminId.toString());
    });

    it('should not create product as regular user', async () => {
      const productData = {
        name: 'New Product',
        description: 'This is a new product description',
        price: 149.99,
        category: 'Clothing',
        stock: 5
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin privileges required');
    });

    it('should not create product without authentication', async () => {
      const productData = {
        name: 'New Product',
        description: 'This is a new product description',
        price: 149.99,
        category: 'Clothing',
        stock: 5
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should add review to product', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product! Highly recommended.'
      };

      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Review added');

      // Verify review was added
      const product = await Product.findById(productId);
      expect(product.reviews).toHaveLength(1);
      expect(product.reviews[0].rating).toBe(5);
    });

    it('should not add duplicate review', async () => {
      // Add first review
      await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Great product!' });

      // Try to add second review
      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 4, comment: 'Still good!' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already reviewed');
    });

    it('should not add review without authentication', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      const res = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});