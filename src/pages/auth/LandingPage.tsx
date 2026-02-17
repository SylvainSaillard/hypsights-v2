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

      {/* Value Proposition Section - Why Hypsights is Different */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08)_0%,transparent_50%)]"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white border border-indigo-200 rounded-full text-indigo-700 text-sm font-medium mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Why choose Hypsights
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              The intelligence your<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">sourcing deserves</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stop guessing. Start knowing exactly <span className="font-semibold">who</span> to contact, <span className="font-semibold">why</span> they matter, and <span className="font-semibold">how</span> to engage them.
            </p>
          </div>

          {/* 3 Key Differentiators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Block 1: AI-Powered Discovery */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-60"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Discovery</h3>
                <p className="text-indigo-600 font-semibold text-sm mb-4">Beyond traditional search</p>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our AI queries <span className="font-semibold">multiple sources simultaneously</span>—search engines, specialized databases, and AI assistants—then filters 90% of noise to surface only relevant suppliers.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Multi-source intelligence</p>
                      <p className="text-gray-500 text-sm">Google, Perplexity, specialized databases</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Smart noise filtering</p>
                      <p className="text-gray-500 text-sm">No blogs, marketplaces, or directories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: 360° Scoring & Transparency */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-500 overflow-hidden lg:-translate-y-4">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-60"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">360° Scoring</h3>
                <p className="text-purple-600 font-semibold text-sm mb-4">Transparent & actionable</p>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Each supplier is evaluated with a <span className="font-semibold">unique 3-dimension model</span>. Every score includes detailed AI explanations—no black box, full transparency.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Product Fit</p>
                      <p className="text-gray-500 text-xs">Technical relevance to your need</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-3 border border-green-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Reliability</p>
                      <p className="text-gray-500 text-xs">Company credibility & stability</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Operational Fit</p>
                      <p className="text-gray-500 text-xs">Geography, size & constraints</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-purple-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Export to Excel/CSV</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3: Expert Deep Search */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-500 overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-bl-full opacity-60"></div>
              
                            
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Expert Deep Search</h3>
                <p className="text-orange-600 font-semibold text-sm mb-4">When AI needs human expertise</p>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our consultants with <span className="font-semibold">20+ years of sourcing expertise</span> validate your shortlist, activate their network, and support you all the way to signature.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Human validation</p>
                      <p className="text-gray-500 text-sm">Network check & reputation verification</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Strategic alignment</p>
                      <p className="text-gray-500 text-sm">Cultural fit & vision matching</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Deal support</p>
                      <p className="text-gray-500 text-sm">From first contact to signature</p>
                    </div>
                  </div>
                </div>
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
                Hypsights is an AI-Assisted Search Service for B2B professionals to find qualified suppliers and technology solutions. Hypsights is owned and operated by Hypsous, a French-based boutique consulting company specialized in Open Innovation and Technology Scouting.
              </p>
            </div>
          </div>
          
          {/* Links */}
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
