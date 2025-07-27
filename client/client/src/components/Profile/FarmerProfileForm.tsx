import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Camera, Briefcase } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface FarmerFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  farmName: string;
  county: string;
  town: string;
  farmSize: string;
  farmSizeUnit: string;
  farmingType: string;
  experience: string;
  description: string;
  specialties: string;
  certifications: string;
}

const FarmerProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<FarmerFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    farmName: '',
    county: '',
    town: '',
    farmSize: '',
    farmSizeUnit: 'acres',
    farmingType: 'conventional',
    experience: '',
    description: '',
    specialties: '',
    certifications: ''
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
        !formData.farmName || !formData.county || !formData.town) {
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

      await axios.post('/farmers/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateProfile(true);
      navigate('/farmer/dashboard');
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
            className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+254 7XX XXX XXX"
              required
            />
          </div>
        </div>
      </div>

      {/* Farm Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Briefcase className="w-5 h-5" />
          <span>Farm Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="farmName"
              value={formData.farmName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. Green Valley Farm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
                min="0"
                step="0.1"
                required
              />
              <select
                name="farmSizeUnit"
                value={formData.farmSizeUnit}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farming Type <span className="text-red-500">*</span>
            </label>
            <select
              name="farmingType"
              value={formData.farmingType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="conventional">Conventional</option>
              <option value="organic">Organic</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="5"
              min="0"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties
            </label>
            <input
              type="text"
              name="specialties"
              value={formData.specialties}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. Organic vegetables, Fruit farming, Greenhouse production"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple specialties with commas</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. Organic certification, GAP certified"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple certifications with commas</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. Kiambu, Limuru"
              required
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farm Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tell potential buyers about your farm, growing practices, and what makes your products special..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Creating Profile...' : 'Create Farmer Profile'}
        </button>
      </div>
    </form>
  );
};

export default FarmerProfileForm;