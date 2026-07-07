import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.name).toBe(userData.name);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should not register user with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'Password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(loginData.email);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'Password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create and login user
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(userData);

      token = registerRes.body.token;
      userId = registerRes.body.user._id;
    });

    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user._id).toBe(userId);
      expect(res.body.user.email).toBe('john@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid token');
    });
  });
});