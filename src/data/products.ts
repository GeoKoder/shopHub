import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio quality.',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Electronics',
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
    featured: true,
    tags: ['wireless', 'bluetooth', 'noise-cancelling']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    price: 299.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Electronics',
    rating: 4.6,
    reviewCount: 1523,
    inStock: true,
    featured: true,
    tags: ['fitness', 'smartwatch', 'gps']
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Sustainable, ultra-soft organic cotton t-shirt available in multiple colors.',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Clothing',
    rating: 4.4,
    reviewCount: 892,
    inStock: true,
    featured: false,
    tags: ['organic', 'cotton', 'sustainable']
  },
  {
    id: '4',
    name: 'Premium Coffee Beans',
    description: 'Single-origin arabica coffee beans, freshly roasted with notes of chocolate and caramel.',
    price: 24.99,
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Food & Beverage',
    rating: 4.9,
    reviewCount: 456,
    inStock: true,
    featured: true,
    tags: ['coffee', 'arabica', 'single-origin']
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    description: 'Sleek LED desk lamp with adjustable brightness and color temperature control.',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Home & Garden',
    rating: 4.7,
    reviewCount: 234,
    inStock: true,
    featured: false,
    tags: ['led', 'minimalist', 'adjustable']
  },
  {
    id: '6',
    name: 'Leather Crossbody Bag',
    description: 'Handcrafted genuine leather crossbody bag with multiple compartments.',
    price: 149.99,
    originalPrice: 189.99,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500',
    images: [
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    category: 'Fashion',
    rating: 4.5,
    reviewCount: 678,
    inStock: true,
    featured: true,
    tags: ['leather', 'handcrafted', 'crossbody']
  }
];

export const categories = [
  'All',
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Fashion'
];