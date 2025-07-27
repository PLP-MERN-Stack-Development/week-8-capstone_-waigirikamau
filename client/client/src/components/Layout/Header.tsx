import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="w-7 h-7 text-green-600" />
            <span className="text-xl font-bold text-gray-900">ShambaConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link
                  to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}
                  className="text-gray-700 hover:text-green-600 text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-green-600 text-sm font-medium transition"
                >
                  Products
                </Link>
                <Link
                  to="/chat"
                  className="text-gray-700 hover:text-green-600 text-sm font-medium transition"
                >
                  Messages
                </Link>
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{user.email}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-700 hover:text-red-600 transition space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
