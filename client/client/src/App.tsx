import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Hero from './components/Home/Hero';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import CreateProfile from './components/Profile/CreateProfile';
import FarmerDashboard from './components/Dashboard/FarmerDashboard';
import BuyerDashboard from './components/Dashboard/BuyerDashboard';
import ProductList from './components/Products/ProductList';
import ProductDetail from './components/Products/ProductDetail';
import CreateProduct from './components/Products/CreateProduct';
import ManageProducts from './components/Products/ManageProducts';
import ChatInterface from './components/Chat/ChatInterface';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Profile Route Component
const ProfileRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.hasProfile) return <Navigate to="/profile/create" replace />;

  return <>{children}</>;
};

// Dashboard Route Component
const DashboardRoute: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (!user.hasProfile) return <Navigate to="/profile/create" replace />;
  
  if (user.role === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
  } else {
    return <Navigate to="/buyer/dashboard" replace />;
  }
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          } />

          <Route path="/profile/create" element={
            <ProtectedRoute>
              <CreateProfile />
            </ProtectedRoute>
          } />

          {/* Farmer Routes */}
          <Route path="/farmer/dashboard" element={
            <ProfileRoute>
              <FarmerDashboard />
            </ProfileRoute>
          } />

          <Route path="/products/create" element={
            <ProfileRoute>
              <CreateProduct />
            </ProfileRoute>
          } />

          <Route path="/products/manage" element={
            <ProfileRoute>
              <ManageProducts />
            </ProfileRoute>
          } />

          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={
            <ProfileRoute>
              <BuyerDashboard />
            </ProfileRoute>
          } />

          {/* Chat Routes */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;