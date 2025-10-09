import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-hypsights-background">
      {/* Header Section - Enhanced with better spacing and visual hierarchy */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
                <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-gray-700 hover:text-primary transition-colors duration-200 px-3 py-2 text-sm font-medium">
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced with colorful gradients and visuals */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 transform -rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-25 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  🚀 B2B Technology Search
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Find <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Faster</span>. Qualify <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Smarter</span>. Connect <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Sooner</span>.
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Hypsights is AI-powered supplier search. It does not just show you what exists. It shows you why it matters for your specific brief.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 px-8 py-4 rounded-lg text-base font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
                >
                  🚀 Get started for free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link 
                  to="/login" 
                  className="bg-white text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 px-8 py-4 rounded-lg text-base font-semibold shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  Log in to your account
                </Link>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>✨ 3 free searches included. No credit card required.</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main dashboard preview - Colorful like real dashboard */}
                <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="ml-4 text-xs text-gray-300 font-mono">🚀 Hypsights Dashboard</div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-powered supplier search</h3>
                          <p className="text-sm text-gray-600">Find the best match for your business needs</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                          ✨ Premium
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md w-full border border-blue-200"></div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md border border-blue-300 flex items-center justify-center">
                            <div className="text-blue-600 font-bold text-2xl">42</div>
                          </div>
                          <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md border border-purple-300 flex items-center justify-center">
                            <div className="text-purple-600 font-bold text-2xl">47</div>
                          </div>
                          <div className="h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-md border border-green-300 flex items-center justify-center">
                            <div className="text-green-600 font-bold text-2xl">318</div>
                          </div>
                        </div>
                        <div className="h-32 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md w-full border border-indigo-200 flex items-center justify-center">
                          <div className="text-indigo-600 font-semibold">📊 Supplier Analytics</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg transform rotate-12 opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transform -rotate-12 opacity-25 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with colorful gradients */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute left-0 top-1/4 w-64 h-64 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full opacity-20 transform -translate-x-1/2 animate-pulse"></div>
          <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-15 transform translate-x-1/2 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">How Hypsights works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our streamlined process helps you find the right suppliers efficiently and tells you <span className="font-semibold">why it matters</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 shadow-lg">
                <span className="text-blue-700 font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">📝 Create Your Brief</h3>
              <p className="text-gray-600 leading-relaxed">
                Describe your business needs using our structured forms. The more details you provide, the better the matches.
              </p>
              <div className="mt-6 pt-6 border-t border-blue-100">
                <div className="flex items-center text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  ✨ Structured form guidance
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-purple-300 md:translate-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 shadow-lg">
                <span className="text-purple-700 font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-4">🤖 AI Assistance</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI assistant helps refine your brief and suggests potential solutions tailored to your specific requirements.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-100">
                <div className="flex items-center text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  🧠 Smart solution suggestions
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-green-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 shadow-lg">
                <span className="text-green-700 font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">⚡ Fast Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Get fast, assessed results through our automated search system, with 3 free searches included in your account
              </p>
              <div className="mt-6 pt-6 border-t border-green-100">
                <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  🎯 Quota-managed searches
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats section - Colorful like dashboard KPIs */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-blue-600 mb-2">3+</div>
              <div className="text-sm text-blue-700 font-medium">🎁 Free searches</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-purple-700 font-medium">🤖 AI assistance</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-green-700 font-medium">✅ Expert validation</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-indigo-600 mb-2">B2B</div>
              <div className="text-sm text-indigo-700 font-medium">🏢 Focused platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with colorful gradients */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-t border-indigo-200 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-l from-blue-300 to-indigo-400 rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Ready to find your ideal suppliers?</h2>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Join Hypsights today and transform how you discover and connect with suppliers for your business. 🚀
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 px-8 py-4 rounded-lg text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              >
                🎯 Get started for free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 px-6 py-4 text-lg font-medium flex items-center justify-center w-full sm:w-auto hover:bg-white hover:shadow-lg rounded-lg"
              >
                Already have an account? Log in 👋
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Questions? Contact our team at <a href="mailto:support@hypsights.com" className="text-primary hover:text-primary-dark font-medium">support@hypsights.com</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo and description */}
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
                Hypsights is an AI-Assisted Search Service for B2B professionals to find qualified suppliers and technology solution. Hypsights is owned and operated by Hypsous, a French-based boutique consulting company specialized in Open Innovation and Technology Scouting.
              </p>
            </div>
          </div>
          
          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-t border-gray-800">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hypsights</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">About us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Cookie policy</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom bar */}
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

export default LandingPage;
