import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-hypsights-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
                <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-gray-700 hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium">
                Log in
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 transform -rotate-12 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto max-w-container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              We're Here to Help
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Get in <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Have questions about Hypsights? Want to provide feedback or discuss your supplier discovery needs? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Contact Us Directly
              </h2>
              <p className="text-xl text-gray-600">
                Reach out to our team for any inquiries or support
              </p>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-12 mb-12">
              <div className="flex items-start mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg transform -rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                    Patrick Ferran
                  </h3>
                  
                  {/* Phone/WhatsApp */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Phone / WhatsApp</div>
                        <a href="tel:+33680729025" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                          +33 6 80 72 90 25
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Email</div>
                        <a href="mailto:patrick.ferran@hypsous.com" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                          patrick.ferran@hypsous.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">General Inquiries</h3>
                <p className="text-gray-600 text-sm">Questions about Hypsights features and capabilities</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Beta Feedback</h3>
                <p className="text-gray-600 text-sm">Share your experience and help us improve</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Technical Support</h3>
                <p className="text-gray-600 text-sm">Need help with your searches or account</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto max-w-container px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Supplier Discovery?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join Hypsights today and experience the power of AI-assisted supplier search. Start with 3 free searches, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="bg-white text-indigo-600 hover:bg-gray-50 transition-all duration-300 px-10 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center w-full sm:w-auto">
                🚀 Get started for free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/about" className="text-white hover:text-blue-100 border-2 border-white hover:border-blue-100 transition-all duration-200 px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center w-full sm:w-auto">
                Learn more about us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="mb-8 max-w-2xl">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-2xl font-bold text-white">Hypsights</span>
                <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hypsights is an AI-Assisted Search Service for B2B professionals to find qualified suppliers and technology solutions. Hypsights is owned and operated by Hypsous, a French-based boutique consulting company specialized in Open Innovation and Technology Scouting.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-t border-gray-800">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hypsights</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">About us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <div className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} Hypsights. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
