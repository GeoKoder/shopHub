import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shophub.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true
    });

    console.log('Created admin user');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        sortOrder: 1
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        sortOrder: 2
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        sortOrder: 3
      },
      {
        name: 'Sports',
        description: 'Sports and fitness equipment',
        sortOrder: 4
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
        sortOrder: 5
      }
    ]);

    console.log('Created categories');

    // Create sample products
    const products = await Product.create([
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio quality. Perfect for music lovers and professionals.',
        price: 199.99,
        originalPrice: 249.99,
        category: 'Electronics',
        stock: 50,
        featured: true,
        tags: ['wireless', 'bluetooth', 'noise-cancelling', 'premium'],
        images: [{
          public_id: 'headphones_1',
          url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Battery Life', value: '30 hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.0' },
          { name: 'Weight', value: '250g' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your workouts and health metrics.',
        price: 299.99,
        category: 'Electronics',
        stock: 30,
        featured: true,
        tags: ['fitness', 'smartwatch', 'gps', 'health'],
        images: [{
          public_id: 'watch_1',
          url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Battery Life', value: '7 days' },
          { name: 'Water Resistance', value: '50m' },
          { name: 'Display', value: '1.4" AMOLED' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Sustainable, ultra-soft organic cotton t-shirt available in multiple colors. Comfortable fit for everyday wear.',
        price: 29.99,
        originalPrice: 39.99,
        category: 'Clothing',
        stock: 100,
        featured: false,
        tags: ['organic', 'cotton', 'sustainable', 'comfortable'],
        images: [{
          public_id: 'tshirt_1',
          url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Material', value: '100% Organic Cotton' },
          { name: 'Fit', value: 'Regular' },
          { name: 'Care', value: 'Machine Wash' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Premium Coffee Beans',
        description: 'Single-origin arabica coffee beans, freshly roasted with notes of chocolate and caramel. Perfect for coffee enthusiasts.',
        price: 24.99,
        category: 'Food & Beverage',
        stock: 75,
        featured: true,
        tags: ['coffee', 'arabica', 'single-origin', 'premium'],
        images: [{
          public_id: 'coffee_1',
          url: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Origin', value: 'Colombia' },
          { name: 'Roast Level', value: 'Medium' },
          { name: 'Weight', value: '500g' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Minimalist Desk Lamp',
        description: 'Sleek LED desk lamp with adjustable brightness and color temperature control. Perfect for any workspace.',
        price: 89.99,
        category: 'Home & Garden',
        stock: 25,
        featured: false,
        tags: ['led', 'minimalist', 'adjustable', 'workspace'],
        images: [{
          public_id: 'lamp_1',
          url: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Power', value: '12W LED' },
          { name: 'Color Temperature', value: '3000K-6500K' },
          { name: 'Dimming', value: '10-100%' }
        ],
        createdBy: admin._id
      },
      {
        name: 'Leather Crossbody Bag',
        description: 'Handcrafted genuine leather crossbody bag with multiple compartments. Stylish and functional for daily use.',
        price: 149.99,
        originalPrice: 189.99,
        category: 'Fashion',
        stock: 40,
        featured: true,
        tags: ['leather', 'handcrafted', 'crossbody', 'stylish'],
        images: [{
          public_id: 'bag_1',
          url: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'
        }],
        specifications: [
          { name: 'Material', value: 'Genuine Leather' },
          { name: 'Dimensions', value: '25x20x8 cm' },
          { name: 'Compartments', value: '3 main + 2 side' }
        ],
        createdBy: admin._id
      }
    ]);

    console.log('Created sample products');

    // Add some reviews to products
    const sampleReviews = [
      {
        user: admin._id,
        name: admin.name,
        rating: 5,
        comment: 'Excellent product! Highly recommended.'
      }
    ];

    for (const product of products) {
      product.reviews = sampleReviews;
      await product.save();
    }

    console.log('Added sample reviews');

    console.log(`
🎉 Database seeded successfully!

Admin User:
Email: admin@shophub.com
Password: Admin123!

Created:
- ${categories.length} categories
- ${products.length} products
- Sample reviews

You can now start the server and test the application.
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();