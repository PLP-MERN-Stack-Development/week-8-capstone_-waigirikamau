import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FarmerProfileForm from './FarmerProfileForm';
import BuyerProfileForm from './BuyerProfileForm';

const CreateProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.hasProfile) {
    navigate(`/${user.role}/dashboard`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              {user.role === 'farmer' 
                ? 'Tell us about your farm and the products you grow'
                : 'Tell us about your business and what you\'re looking to buy'
              }
            </p>
          </div>

          {user.role === 'farmer' ? (
            <FarmerProfileForm />
          ) : (
            <BuyerProfileForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;