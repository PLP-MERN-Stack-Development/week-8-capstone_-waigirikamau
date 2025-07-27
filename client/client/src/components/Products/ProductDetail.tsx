import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Calendar, Eye, Heart, Phone, MessageCircle, 
  Star, Truck, Shield, CheckCircle, AlertCircle 
} from 'lucide-react';
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
  minimumOrder?: { amount: number; unit: string };
  availableUntil?: string;
  status: string;
  location: { county: string; town: string };
  deliveryOptions: string[];
  tags: string[];
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
    reviewsCount: number;
    phoneNumber: string;
    experience: number;
    farmSize: number;
    farmSizeUnit: string;
    farmingType: string;
    specialties: string[];
  };
  createdAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to express interest');
      return;
    }

    try {
      await axios.post(`/products/${id}/interest`);
      alert('Interest expressed successfully! The farmer will be notified.');
      fetchProduct();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error expressing interest');
    }
  };

  const handleContactFarmer = () => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to contact farmers');
      return;
    }
    // Navigate to chat with farmer
    navigate(`/chat?farmer=${product.farmerId._id}&product=${product._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              {product.images.length > 0 ? (
                <img
                  src={`${API_BASE_URL}/uploads/${product.images[selectedImage]}`}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <button
                  onClick={handleInterest}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  disabled={user?.role !== 'buyer'}
                >
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize">
                  {product.category}
                </span>
                {product.organicCertified && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    Organic Certified
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {product.qualityGrade}
                </span>
                {!product.isHarvested && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    Pre-harvest
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{product.interested.length} interested</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900">Price per {product.quantity.unit}</span>
                <span className="text-3xl font-bold text-green-600">
                  KES {product.pricePerUnit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Available Quantity</span>
                <span className="font-medium">
                  {product.quantity.amount} {product.quantity.unit}
                </span>
              </div>
              {product.minimumOrder && (
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Minimum Order</span>
                  <span className="font-medium">
                    {product.minimumOrder.amount} {product.minimumOrder.unit}
                  </span>
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  {product.location.town}, {product.location.county}
                </span>
              </div>

              {(product.harvestDate || product.expectedHarvestDate) && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {product.isHarvested 
                      ? `Harvested on ${new Date(product.harvestDate!).toLocaleDateString()}`
                      : `Expected harvest: ${new Date(product.expectedHarvestDate!).toLocaleDateString()}`
                    }
                  </span>
                </div>
              )}

              {product.deliveryOptions.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Delivery: {product.deliveryOptions.join(', ')}
                  </span>
                </div>
              )}

              {product.availableUntil && (
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-700">
                    Available until {new Date(product.availableUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user?.role === 'buyer' && (
                <>
                  <button
                    onClick={handleContactFarmer}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Contact Farmer</span>
                  </button>
                  
                  {showContactInfo && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        You can contact {product.farmerId.firstName} directly:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{product.farmerId.phoneNumber}</span>
                        </div>
                        <Link
                          to={`/chat?farmer=${product.farmerId._id}&product=${product._id}`}
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Start Chat Conversation</span>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleInterest}
                    className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Express Interest</span>
                  </button>
                </>
              )}

              {!user && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-3">Login to contact the farmer and express interest</p>
                  <Link
                    to="/login"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h2>
              {product.description ? (
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}

              {product.variety && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Variety</h3>
                  <p className="text-gray-700">{product.variety}</p>
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Farmer Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Farmer</h2>
              
              <div className="flex items-center space-x-3 mb-4">
                {product.farmerId.profileImage ? (
                  <img
                    src={`http://localhost:5000/uploads/${product.farmerId.profileImage}`}
                    alt={product.farmerId.farmName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{product.farmerId.farmName}</h3>
                  <p className="text-gray-600">
                    {product.farmerId.firstName} {product.farmerId.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{product.farmerId.experience} years</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Farm Size</span>
                  <span className="font-medium">
                    {product.farmerId.farmSize} {product.farmerId.farmSizeUnit}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Farming Type</span>
                  <span className="font-medium capitalize">{product.farmerId.farmingType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">
                    {product.farmerId.location.town}, {product.farmerId.location.county}
                  </span>
                </div>

                {product.farmerId.rating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{product.farmerId.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({product.farmerId.reviewsCount})</span>
                    </div>
                  </div>
                )}
              </div>

              {product.farmerId.specialties.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.farmerId.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to={`/farmers/${product.farmerId._id}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center block"
                >
                  View Farmer Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;