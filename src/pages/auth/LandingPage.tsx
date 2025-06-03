import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hypsights-background">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">Hypsights</span>
              <span className="ml-1 text-sm text-primary font-semibold">v2</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Log in
              </Link>
              <Link to="/signup" className="bg-primary text-primary-foreground hover:scale-105 transition duration-200 px-4 py-2 rounded-md text-sm font-semibold shadow-sm">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 bg-gradient-to-b from-white to-hypsights-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Find the <span className="text-primary">perfect suppliers</span> for your business needs
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                Hypsights helps professionals discover qualified suppliers and products through AI-assisted search and expert validation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-primary text-primary-foreground hover:scale-105 transition duration-200 px-6 py-3 rounded-md text-base font-semibold shadow-md text-center">
                  Get started for free
                </Link>
                <Link to="/login" className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-6 py-3 rounded-md text-base font-semibold shadow-sm text-center">
                  Log in to your account
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                3 free searches included. No credit card required.
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 transform rotate-1">
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">AI-powered supplier search dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-hypsights-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Hypsights works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Brief</h3>
              <p className="text-gray-600">
                Describe your business needs using our structured forms. The more details you provide, the better the matches.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-800 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistance</h3>
              <p className="text-gray-600">
                Our AI assistant helps refine your brief and suggests potential solutions for your specific requirements.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-800 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Search</h3>
              <p className="text-gray-600">
                Get immediate results through our automated search system, with 3 free searches included in your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to find your ideal suppliers?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Hypsights today and transform how you discover and connect with suppliers for your business.
          </p>
          <Link to="/signup" className="inline-block bg-primary text-primary-foreground hover:scale-105 transition duration-200 px-8 py-4 rounded-md text-lg font-semibold shadow-md">
            Get started for free
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Questions? Contact our team at <a href="mailto:support@hypsights.com" className="text-primary hover:underline">support@hypsights.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hypsights</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">About us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Help center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Terms</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white text-sm">Cookie policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Hypsights. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
