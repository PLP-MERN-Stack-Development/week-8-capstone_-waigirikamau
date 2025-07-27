import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, MessageCircle, TrendingUp, Eye, Heart } from 'lucide-react';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: { amount: number; unit: string };
  pricePerUnit: number;
  status: string;
  views: number;
  interested: any[];
  images: string[];
  createdAt: string;
}

const FarmerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    interestedBuyers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products/my-products');
      setProducts(response.data);
      
      // Calculate stats
      const totalProducts = response.data.length;
      const activeProducts = response.data.filter((p: Product) => p.status === 'available').length;
      const totalViews = response.data.reduce((sum: number, p: Product) => sum + p.views, 0);
      const interestedBuyers = response.data.reduce((sum: number, p: Product) => sum + p.interested.length, 0);
      
      setStats({ totalProducts, activeProducts, totalViews, interestedBuyers });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
          <p className="text-gray-600">Manage your products and connect with buyers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                <p className="text-gray-600">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeProducts}</h3>
                <p className="text-gray-600">Active Listings</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews}</h3>
                <p className="text-gray-600">Total Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{stats.interestedBuyers}</h3>
                <p className="text-gray-600">Interested Buyers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/products/create"
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
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

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            <Link
              to="/products/manage"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't listed any products yet</p>
              <Link
                to="/products/create"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  {product.images.length > 0 && (
                    <img
                      src={`http://localhost:5000/uploads/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>
                  <p className="text-lg font-bold text-green-600 mb-2">
                    KES {product.pricePerUnit}/{product.quantity.unit}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{product.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{product.interested.length}</span>
                      </span>
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

export default FarmerDashboard;