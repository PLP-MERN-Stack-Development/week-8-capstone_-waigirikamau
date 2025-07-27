import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Sprout className="w-8 h-8 text-green-500" />
              <span className="font-bold text-xl">ShambaConnect</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting farmers directly with buyers to create a transparent,
              efficient, and profitable agricultural marketplace for everyone.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@shambaconnect.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+254 712 345678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2" aria-label="Quick Links">
              <li><Link to="/products" className="text-gray-300 hover:text-green-400 transition-colors">Browse Products</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-green-400 transition-colors">Join as Farmer</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-green-400 transition-colors">Join as Buyer</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2" aria-label="Support Links">
              <li><Link to="/help" className="text-gray-300 hover:text-green-400 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-green-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ShambaConnect. All rights reserved. Empowering African Agriculture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
