import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Heart, Eye, Phone, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Configure image base URL
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.herokuapp.com' // Replace with your deployed backend URL
  : 'http://localhost:5000';

interface Product {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  variety?: string;
  description?: string;
  images: string[];
  quantity: { amount: number; unit: string };
  pricePerUnit: number;
  currency: string;
  harvestDate?: string;
  expectedHarvestDate?: string;
  isHarvested: boolean;
  qualityGrade: string;
  organicCertified: boolean;
  status: string;
  location: { county: string; town: string };
  views: number;
  interested: any[];
  farmerId: {
    _id: string;
    farmName: string;
    firstName: string;
    lastName: string;
    location: { county: string; town: string };
    profileImage?: string;
    rating: number;
    phoneNumber: string;
  };
  createdAt: string;
}

interface Filters {
  category: string;
  county: string;
  town: string;
  minPrice: string;
  maxPrice: string;
  isHarvested: string;
  organicCertified: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    county: '',
    town: '',
    minPrice: '',
    maxPrice: '',
    isHarvested: '',
    organicCertified: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  const { user } = useAuth();

  const categories = [
    'cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'herbs'
  ];

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    'Garissa', 'Kakamega', 'Meru', 'Nyeri', 'Machakos', 'Kericho', 'Bungoma',
    'Kiambu', 'Murang\'a', 'Embu', 'Isiolo', 'Marsabit', 'Turkana', 'West Pokot',
    'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia',
    'Samburu', 'Mandera', 'Wajir', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
    'Kwale', 'Makueni', 'Kitui', 'Mwingi', 'Tharaka-Nithi', 'Imenti', 'Kirinyaga',
    'Nyandarua', 'Kajiado', 'Narok', 'Bomet', 'Nyamira', 'Kisii',
    'Migori', 'Homa Bay', 'Siaya', 'Vihiga', 'Busia'
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.category) params.append('category', filters.category);
      if (filters.county) params.append('county', filters.county);
      if (filters.town) params.append('town', filters.town);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.isHarvested) params.append('isHarvested', filters.isHarvested);
      if (filters.organicCertified) params.append('organicCertified', filters.organicCertified);
      
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await axios.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
    // Trigger fetch with new filters
    fetchProducts(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      county: '',
      town: '',
      minPrice: '',
      maxPrice: '',
      isHarvested: '',
      organicCertified: ''
    });
    setSearchTerm('');
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
    // Trigger a new fetch with cleared filters
    fetchProducts(1);
  };

  const handleInterest = async (productId: string) => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to express interest');
      return;
    }

    try {
      await axios.post(`/products/${productId}/interest`);
      alert('Interest expressed successfully! The farmer will be notified.');
      fetchProducts(pagination.currentPage);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error expressing interest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">Discover fresh produce from local farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, farmers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                  <select
                    value={filters.county}
                    onChange={(e) => handleFilterChange('county', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Counties</option>
                    {counties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (KES)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (KES)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Status</label>
                  <select
                    value={filters.isHarvested}
                    onChange={(e) => handleFilterChange('isHarvested', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Already Harvested</option>
                    <option value="false">Pre-harvest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organic</label>
                  <select
                    value={filters.organicCertified}
                    onChange={(e) => handleFilterChange('organicCertified', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Organic Certified</option>
                    <option value="false">Conventional</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={applyFilters}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {products.length} of {pagination.totalProducts} products
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative">
                  {product.images.length > 0 ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1">
                    {product.organicCertified && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Organic
                      </span>
                    )}
                    {!product.isHarvested && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Pre-harvest
                      </span>
                    )}
                  </div>

                  {/* Quality Grade */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {product.qualityGrade}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    <button
                      onClick={() => handleInterest(product._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      disabled={user?.role !== 'buyer'}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>
                  
                  {product.variety && (
                    <p className="text-sm text-gray-500 mb-2">Variety: {product.variety}</p>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xl font-bold text-green-600">
                      KES {product.pricePerUnit.toLocaleString()}/{product.quantity.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.quantity.amount} {product.quantity.unit} available
                    </p>
                  </div>

                  {/* Farmer Info */}
                  <div className="flex items-center space-x-2 mb-3">
                    {product.farmerId.profileImage ? (
                      <img
                        src={`http://localhost:5000/uploads/${product.farmerId.profileImage}`}
                        alt={product.farmerId.farmName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.farmerId.farmName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.farmerId.firstName} {product.farmerId.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{product.location.town}, {product.location.county}</span>
                  </div>

                  {/* Harvest Date */}
                  {(product.harvestDate || product.expectedHarvestDate) && (
                    <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {product.isHarvested 
                          ? `Harvested: ${new Date(product.harvestDate!).toLocaleDateString()}`
                          : `Expected: ${new Date(product.expectedHarvestDate!).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
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

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {user?.role === 'buyer' && (
                      <Link
                        to={`/chat?farmer=${product.farmerId._id}&product=${product._id}`}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProducts(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;