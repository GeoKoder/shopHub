import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { QuickView } from './components/QuickView';
import { AuthModal } from './components/AuthModal';
import { Checkout } from './components/Checkout';
import { OrderSuccess } from './components/OrderSuccess';
import { products } from './data/products';
import { Product } from './types';

type ViewMode = 'shop' | 'checkout' | 'success';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Rating filter
      const matchesRating = selectedRating === 0 || product.rating >= selectedRating;

      // Stock filter
      const matchesStock = !showInStockOnly || product.inStock;

      // Featured filter
      const matchesFeatured = !showFeaturedOnly || product.featured;

      return matchesSearch && matchesCategory && matchesPrice && 
             matchesRating && matchesStock && matchesFeatured;
    });
  }, [searchQuery, selectedCategory, priceRange, selectedRating, showInStockOnly, showFeaturedOnly]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCheckout = () => {
    setViewMode('checkout');
  };

  const handleOrderComplete = () => {
    setViewMode('success');
  };

  const handleContinueShopping = () => {
    setViewMode('shop');
  };

  if (viewMode === 'checkout') {
    return (
      <Checkout
        onBack={() => setViewMode('shop')}
        onComplete={handleOrderComplete}
      />
    );
  }

  if (viewMode === 'success') {
    return <OrderSuccess onContinueShopping={handleContinueShopping} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center justify-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 mb-6"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </button>

          {/* Sidebar */}
          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            showInStockOnly={showInStockOnly}
            onInStockChange={setShowInStockOnly}
            showFeaturedOnly={showFeaturedOnly}
            onFeaturedChange={setShowFeaturedOnly}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h2>
                <span className="text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
              {searchQuery && (
                <p className="text-gray-600">
                  Search results for "<span className="font-medium">{searchQuery}</span>"
                </p>
              )}
            </div>

            {/* Featured Products Banner */}
            {selectedCategory === 'All' && !searchQuery && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Featured Products</h3>
                <p className="text-indigo-100 mb-4">
                  Discover our most popular items with special offers and discounts
                </p>
                <button
                  onClick={() => setShowFeaturedOnly(true)}
                  className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors duration-200"
                >
                  Shop Featured
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={filteredProducts} onQuickView={handleQuickView} />
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <QuickView
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default App;