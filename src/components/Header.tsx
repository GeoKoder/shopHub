import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCartClick,
  onAuthClick,
  searchQuery,
  onSearchChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ShopHub
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              Products
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              Categories
            </a>
            <a href="#" className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
              About
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <button className="p-2 text-gray-700 hover:text-red-500 transition-colors duration-200">
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm text-gray-700">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">
                Home
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">
                Products
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">
                Categories
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-indigo-600">
                About
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};