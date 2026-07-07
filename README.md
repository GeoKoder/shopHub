# E-commerce Platform - MERN Stack

A comprehensive, production-ready e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring modern UI/UX, real-time functionality, and robust backend architecture.

## 🚀 Features

### Frontend
- **Modern React UI** with TypeScript and Tailwind CSS
- **Responsive Design** optimized for all devices
- **Advanced Product Catalog** with filtering, search, and sorting
- **Shopping Cart** with persistent storage
- **Secure Checkout Process** with multiple payment options
- **User Authentication** with JWT tokens
- **Real-time Updates** for inventory and orders
- **Wishlist Management**
- **Product Reviews and Ratings**

### Backend
- **RESTful API** with Express.js
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** with role-based access control
- **File Upload** with Cloudinary integration
- **Real-time Communication** with Socket.io
- **Comprehensive Testing** with Jest and Supertest
- **Security Features** including rate limiting and validation
- **Email Notifications** for orders and account management
- **Admin Dashboard** functionality

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling
- Socket.io Client for real-time features

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- Cloudinary for image storage
- Jest for testing
- Nodemailer for emails

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Environment Setup

#### Backend Environment
Create `server/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
MONGODB_TEST_URI=mongodb://localhost:27017/ecommerce_test

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 5. Seed Database (Optional)
```bash
npm run server:seed
```

This creates:
- Admin user (admin@shophub.com / Admin123!)
- Sample products and categories
- Test data for development

### 6. Start Development Servers

#### Option A: Start Both Servers
```bash
npm run dev:full
```

#### Option B: Start Individually
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
ecommerce-platform/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── data/                     # Static data and mock data
│   └── App.tsx                   # Main application component
├── server/                       # Backend Node.js application
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Express middleware
│   ├── models/                   # Mongoose models
│   ├── routes/                   # API routes
│   ├── utils/                    # Utility functions
│   ├── socket/                   # Socket.io handlers
│   ├── tests/                    # Test files
│   ├── scripts/                  # Database scripts
│   └── server.js                 # Main server file
├── package.json                  # Frontend dependencies
└── README.md                     # Project documentation
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
npm run server:test

# Run tests with coverage
cd server && npm run test:coverage

# Run tests in watch mode
cd server && npm run test:watch
```

### Test Coverage
The backend includes comprehensive tests for:
- Authentication endpoints
- Product management
- Order processing
- User management
- Error handling
- Validation

## 🔐 Authentication

### User Roles
- **User**: Can browse products, manage cart, place orders
- **Admin**: Full access including product and user management

### Default Admin Account
After seeding the database:
- **Email**: admin@shophub.com
- **Password**: Admin123!

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Include JWT token in requests:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

#### Products
- `GET /products` - Get products with filtering
- `GET /products/:id` - Get single product
- `POST /products` - Create product (Admin)
- `POST /products/:id/reviews` - Add product review

#### Orders
- `POST /orders` - Create new order
- `GET /orders/my-orders` - Get user orders
- `GET /orders` - Get all orders (Admin)

#### Users
- `GET /users/wishlist` - Get user wishlist
- `POST /users/wishlist/:productId` - Add to wishlist

### Query Parameters

#### Product Filtering
```
GET /products?category=Electronics&minPrice=50&maxPrice=200&search=wireless&featured=true&sort=-rating&page=1&limit=12
```

## 🔄 Real-time Features

The application includes Socket.io for real-time updates:

### Events
- **inventory_update**: Product stock changes
- **order_update**: Order status changes
- **new_order**: New order notifications (admin)

### Client Usage
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: userToken }
});

socket.on('inventory_update', (data) => {
  // Handle stock updates
});
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js protection
- **CORS Configuration**: Secure cross-origin requests
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt encryption
- **File Upload Security**: Type and size validation

## 🚀 Deployment

### Backend Deployment
1. **Environment Variables**: Set all required env vars
2. **Database**: Use MongoDB Atlas for production
3. **File Storage**: Configure Cloudinary
4. **Process Manager**: Use PM2 for production
5. **Reverse Proxy**: Configure Nginx
6. **SSL/TLS**: Enable HTTPS

### Frontend Deployment
1. **Build**: `npm run build`
2. **Static Hosting**: Deploy to Netlify, Vercel, or similar
3. **Environment**: Update API URLs for production

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Monitoring and Logging

### Backend Logging
- **Development**: Console logging with Morgan
- **Production**: File-based logging with rotation
- **Error Tracking**: Separate error logs
- **Request Logging**: Detailed request/response logs

### Health Monitoring
- **Health Check**: `GET /health`
- **Database Status**: Connection monitoring
- **API Performance**: Response time tracking

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** tests for new features
4. **Ensure** all tests pass (`npm run server:test`)
5. **Commit** changes (`git commit -m 'Add amazing feature'`)
6. **Push** to branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Ensure responsive design for UI changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Database Connection
```bash
# Check MongoDB status
mongod --version
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS
```

#### Port Conflicts
```bash
# Check what's running on port 5000
lsof -i :5000
# Kill process if needed
kill -9 <PID>
```

#### Environment Variables
Ensure all required environment variables are set in `server/.env`

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the API documentation
- Check server logs for error details

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core e-commerce functionality
- ✅ User authentication and authorization
- ✅ Product catalog with filtering
- ✅ Shopping cart and checkout
- ✅ Order management
- ✅ Real-time updates

### Phase 2 (Planned)
- 🔄 Payment gateway integration (Stripe)
- 🔄 Advanced admin dashboard
- 🔄 Inventory management
- 🔄 Email marketing integration
- 🔄 Analytics and reporting
- 🔄 Mobile app (React Native)

### Phase 3 (Future)
- 📋 Multi-vendor marketplace
- 📋 Advanced recommendation engine
- 📋 Internationalization (i18n)
- 📋 Progressive Web App (PWA)
- 📋 AI-powered features

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.io** for real-time communication
- **Pexels** for the stock images used in the demo

---

**Built with ❤️ using the MERN Stack**