import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, ShoppingCart, TrendingUp, Heart, Eye } from 'lucide-react';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: { amount: number; unit: string };
  pricePerUnit: number;
  images: string[];
  farmerId: {
    farmName: string;
    firstName: string;
    lastName: string;
    location: { county: string; town: string };
  };
  location: { county: string; town: string };
  createdAt: string;
}

const BuyerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products?limit=12');
      setProducts(response.data.products);
      setFeaturedProducts(response.data.products.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'herbs'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
          <p className="text-gray-600">Discover fresh produce from local farmers</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products, farmers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Link
              to={`/products?search=${searchTerm}`}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-green-300 transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/products"
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Browse All Products</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>View Messages</span>
            </Link>
            <Link
              to="/profile/edit"
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span>Update Profile</span>
            </Link>
          </div>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All Products
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No products available at the moment</p>
              <p className="text-gray-400">Check back later for fresh listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {product.images.length > 0 && (
                    <img
                      src={`http://localhost:5000/uploads/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>
                    <p className="text-lg font-bold text-green-600 mb-2">
                      KES {product.pricePerUnit}/{product.quantity.unit}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <span>{product.farmerId.farmName}</span>
                      <span>{product.location.county}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/chat?farmer=${product.farmerId._id}&product=${product._id}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;