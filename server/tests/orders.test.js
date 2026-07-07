import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test';

describe('Order Endpoints', () => {
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
    await Order.deleteMany({});

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

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        orderItems: [{
          product: productId,
          name: 'Test Product',
          price: 99.99,
          image: 'https://example.com/image.jpg',
          quantity: 2
        }],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        paymentInfo: {
          id: 'pi_test_123',
          status: 'succeeded',
          method: 'card'
        },
        itemsPrice: 199.98,
        taxPrice: 16.00,
        shippingPrice: 9.99,
        totalPrice: 225.97
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.order.totalPrice).toBe(225.97);
      expect(res.body.order.orderItems).toHaveLength(1);

      // Verify product stock was updated
      const product = await Product.findById(productId);
      expect(product.stock).toBe(8); // 10 - 2
      expect(product.sold).toBe(2);
    });

    it('should not create order with insufficient stock', async () => {
      const orderData = {
        orderItems: [{
          product: productId,
          name: 'Test Product',
          price: 99.99,
          image: 'https://example.com/image.jpg',
          quantity: 15 // More than available stock (10)
        }],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        paymentInfo: {
          method: 'card'
        },
        itemsPrice: 1499.85,
        taxPrice: 120.00,
        shippingPrice: 9.99,
        totalPrice: 1629.84
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should not create order without authentication', async () => {
      const orderData = {
        orderItems: [{
          product: productId,
          name: 'Test Product',
          price: 99.99,
          image: 'https://example.com/image.jpg',
          quantity: 1
        }],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        paymentInfo: {
          method: 'card'
        },
        itemsPrice: 99.99,
        taxPrice: 8.00,
        shippingPrice: 9.99,
        totalPrice: 117.98
      };

      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    beforeEach(async () => {
      // Create test order
      const order = new Order({
        user: userId,
        orderItems: [{
          product: productId,
          name: 'Test Product',
          price: 99.99,
          image: 'https://example.com/image.jpg',
          quantity: 1
        }],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        paymentInfo: {
          method: 'card'
        },
        itemsPrice: 99.99,
        taxPrice: 8.00,
        shippingPrice: 9.99,
        totalPrice: 117.98
      });
      await order.save();
    });

    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.orders[0].totalPrice).toBe(117.98);
    });

    it('should not get orders without authentication', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders (Admin)', () => {
    beforeEach(async () => {
      // Create test orders
      const order1 = new Order({
        user: userId,
        orderItems: [{
          product: productId,
          name: 'Test Product',
          price: 99.99,
          image: 'https://example.com/image.jpg',
          quantity: 1
        }],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1234567890'
        },
        paymentInfo: { method: 'card' },
        itemsPrice: 99.99,
        taxPrice: 8.00,
        shippingPrice: 9.99,
        totalPrice: 117.98
      });
      await order1.save();
    });

    it('should get all orders as admin', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.stats).toBeDefined();
    });

    it('should not get all orders as regular user', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin privileges required');
    });
  });
});