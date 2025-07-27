import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, ShoppingCart, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  const buttonClass =
    'px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2';

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Connecting <span className="text-green-600">Farmers</span> with{' '}
          <span className="text-blue-600">Buyers</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          ShambaConnect bridges the gap between agricultural producers and buyers,
          creating a transparent marketplace that benefits everyone in the supply chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/register"
            className={`bg-green-600 hover:bg-green-700 text-white ${buttonClass}`}
            aria-label="Register to get started"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/products"
            className={`border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white ${buttonClass}`}
            aria-label="Browse available products"
          >
            Browse Products
          </Link>
        </div>

        <div className="relative">
          <img
            src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Group of African farmers standing in a green field"
            className="rounded-2xl shadow-2xl mx-auto max-w-4xl w-full h-64 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ShambaConnect?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform is designed to empower both farmers and buyers with the tools they need to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="w-6 h-6 text-green-600" />,
              title: 'Direct Connection',
              description:
                'Connect directly with farmers and buyers, eliminating middlemen and increasing profits for everyone.',
              bg: 'bg-green-100',
            },
            {
              icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
              title: 'Easy Trading',
              description:
                'Simple and intuitive platform for listing products, browsing offers, and conducting transactions.',
              bg: 'bg-blue-100',
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
              title: 'Fair Pricing',
              description:
                'Transparent pricing with real-time market information to ensure fair value for all parties.',
              bg: 'bg-orange-100',
            },
          ].map(({ icon, title, description, bg }) => (
            <div
              key={title}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center mb-6`}>
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Agriculture?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of farmers and buyers already using ShambaConnect
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              aria-label="Join as a Farmer"
            >
              Join as Farmer
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              aria-label="Join as a Buyer"
            >
              Join as Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
