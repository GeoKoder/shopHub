# E-commerce Backend API

A comprehensive RESTful API for an e-commerce platform built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations with image uploads, reviews, and ratings
- **Order Management**: Complete order lifecycle with status tracking
- **User Management**: Profile management, wishlist, and address book
- **Real-time Updates**: Socket.io for live inventory and order updates
- **Security**: Rate limiting, input validation, and security headers
- **Testing**: Comprehensive test suite with Jest and Supertest
- **Documentation**: API documentation and setup guides

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone and setup**:
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Seed Database** (optional):
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review
- `PUT /api/products/:id/reviews/:reviewId` - Update review
- `DELETE /api/products/:id/reviews/:reviewId` - Delete review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Users
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## Query Parameters

### Products Filtering
```
GET /api/products?category=Electronics&minPrice=50&maxPrice=200&search=wireless&featured=true&inStock=true&sort=-rating&page=1&limit=12
```

### Pagination
All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10-20 depending on endpoint)

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Wireless Headphones",
      "price": 199.99,
      "image": "https://example.com/image.jpg",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States",
    "phone": "+1234567890"
  },
  "paymentInfo": {
    "method": "card"
  },
  "itemsPrice": 199.99,
  "taxPrice": 16.00,
  "shippingPrice": 9.99,
  "totalPrice": 225.98
}
```

## Real-time Features

The API includes Socket.io for real-time updates:

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for inventory updates
socket.on('inventory_update', (data) => {
  console.log('Stock updated:', data);
});

// Listen for order updates
socket.on('order_update', (data) => {
  console.log('Order status changed:', data);
});
```

### Events
- `inventory_update` - Product stock changes
- `order_update` - Order status changes
- `new_order` - New order created (admin only)

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `tests/auth.test.js` - Authentication endpoints
- `tests/products.test.js` - Product management
- `tests/orders.test.js` - Order processing
- `tests/setup.js` - Test configuration

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive validation using express-validator
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **File Upload Security**: Multer with file type validation

## Error Handling

The API uses a centralized error handling system:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Logging

- **Development**: Console logging with Morgan
- **Production**: File-based logging with rotation
- **Error Tracking**: Separate error logs
- **Request Logging**: Detailed request/response logging

## Deployment

### Environment Variables
Ensure all required environment variables are set:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_*` variables
- `EMAIL_*` variables (if using email features)

### Production Considerations
- Use a process manager (PM2)
- Set up MongoDB replica sets
- Configure reverse proxy (Nginx)
- Enable SSL/TLS
- Set up monitoring and logging
- Configure backup strategies

## API Documentation

For detailed API documentation, start the server and visit:
- Health Check: `GET /health`
- API Base: `http://localhost:5000/api`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.