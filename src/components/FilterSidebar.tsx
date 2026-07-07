import React from 'react';
import { Filter, X, Star } from 'lucide-react';
import { categories } from '../data/products';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedRating: number;
  onRatingChange: (rating: number) => void;
  showInStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  showFeaturedOnly: boolean;
  onFeaturedChange: (featured: boolean) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  showInStockOnly,
  onInStockChange,
  showFeaturedOnly,
  onFeaturedChange,
}) => {
  const clearAllFilters = () => {
    onCategoryChange('All');
    onPriceRangeChange([0, 1000]);
    onRatingChange(0);
    onInStockChange(false);
    onFeaturedChange(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto bg-white z-50 lg:z-0 w-80 lg:w-64 p-6 
        transform transition-transform duration-300 ease-in-out border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={() => onCategoryChange(category)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Price Range</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Minimum Rating</h4>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={() => onRatingChange(rating)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                      {rating} & up
                    </span>
                  </div>
                </label>
              ))}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={0}
                  checked={selectedRating === 0}
                  onChange={() => onRatingChange(0)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                  All ratings
                </span>
              </label>
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Additional Filters</h4>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                  In stock only
                </span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => onFeaturedChange(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                  Featured products
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};