import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Camera, Building } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface BuyerFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  businessName: string;
  businessType: string;
  businessRegistration: string;
  county: string;
  town: string;
  address: string;
  description: string;
  interestedProducts: string;
  preferredDeliveryMethods: string;
  paymentMethods: string;
}

const BuyerProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<BuyerFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    businessName: '',
    businessType: 'retailer',
    businessRegistration: '',
    county: '',
    town: '',
    address: '',
    description: '',
    interestedProducts: '',
    preferredDeliveryMethods: '',
    paymentMethods: ''
  });

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    'Garissa', 'Kakamega', 'Meru', 'Nyeri', 'Machakos', 'Kericho', 'Bungoma',
    'Kiambu', 'Murang\'a', 'Embu', 'Isiolo', 'Marsabit', 'Turkana', 'West Pokot',
    'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia',
    'Samburu', 'Mandera', 'Wajir', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
    'Kwale', 'Makueni', 'Kitui', 'Mwingi', 'Tharaka-Nithi', 'Imenti', 'Kirinyaga',
    'Nyandarua', 'Kajiado', 'Narok', 'Bomet', 'Kericho', 'Nyamira', 'Kisii',
    'Migori', 'Homa Bay', 'Siaya', 'Vihiga', 'Busia'
  ];

  const businessTypes = [
    'retailer', 'wholesaler', 'processor', 'exporter', 'restaurant', 'other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        setProfileImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file under 5MB');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
        !formData.businessName || !formData.county || !formData.town) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Add profile image if selected
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      await axios.post('/buyers/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateProfile(true);
      navigate('/buyer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Profile Image */}
      <div className="text-center">
        <div className="relative inline-block">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="profileImage"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">Upload your profile photo</p>
      </div>

      {/* Personal Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Personal Information</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+254 7XX XXX XXX"
              required
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Building className="w-5 h-5" />
          <span>Business Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Fresh Market Ltd"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {businessTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Registration Number
            </label>
            <input
              type="text"
              name="businessRegistration"
              value={formData.businessRegistration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. BN/2023/12345"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interested Products
            </label>
            <input
              type="text"
              name="interestedProducts"
              value={formData.interestedProducts}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Fresh vegetables, Organic fruits, Cereals"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple products with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Methods
            </label>
            <input
              type="text"
              name="preferredDeliveryMethods"
              value={formData.preferredDeliveryMethods}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Pickup, Local delivery, Shipping"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple methods with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Methods
            </label>
            <input
              type="text"
              name="paymentMethods"
              value={formData.paymentMethods}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Cash, M-Pesa, Bank transfer"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple methods with commas</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Location</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County <span className="text-red-500">*</span>
            </label>
            <select
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select County</option>
              {counties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Town/Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Westlands, CBD"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Street address, building name, floor, etc."
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell farmers about your business, what you buy, your market reach, and why they should choose you..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Creating Profile...' : 'Create Buyer Profile'}
        </button>
      </div>
    </form>
  );
};

export default BuyerProfileForm;