import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const teamMembers = [
    {
      name: 'Patrick Ferran',
      title: 'CEO - Project Management & Innovation Expert',
      bio: 'Expert in project management, innovation, solution finder and connection facilitator. Holds degrees in Engineering, MBA, and Philosophy.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'Dezarae Carver',
      title: 'Senior Technology Scout & Project Manager',
      bio: 'Specialist in project management and open innovation, technology scout with a Master\'s degree in Electrical Engineering.',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      name: 'Marc de Fouchécour',
      title: 'Scientific Advisor - AI & Machine Learning Expert',
      bio: 'Expert in artificial intelligence, machine learning, knowledge management, and blockchain. Graduate of École Polytechnique with a DEA in Applied Mathematics.',
      color: 'from-blue-600 to-purple-600'
    },
    {
      name: 'Dr. Sudeshna Ghosh',
      title: 'Senior Associate Researcher - Biophysical Chemistry Expert',
      bio: 'Ph.D. in Biophysical Chemistry, bringing deep scientific expertise to our technology scouting capabilities.',
      color: 'from-indigo-600 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-hypsights-background">
      {/* Header Section - Identical to Landing Page */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
                <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
              </Link>
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

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 transform -rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-25 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                About Our Company
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                About <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Hypsights</span>
              </h1>
              <p className="text-2xl font-semibold text-gray-700 mb-4">
                AI-Powered Supplier Search for B2B Professionals
              </p>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hypsights is an AI-Assisted Search Service helping B2B professionals find qualified suppliers and technology solutions. We don't just show you what exists – we show you why it matters for your specific needs.
            </p>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute left-0 top-1/4 w-64 h-64 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full opacity-20 transform -translate-x-1/2 animate-pulse"></div>
          <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-15 transform translate-x-1/2 animate-pulse"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-300 rounded-2xl flex items-center justify-center transform -rotate-3 shadow-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Powered by Hypsous
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Hypsights is owned and operated by <span className="font-semibold text-gray-800">Hypsous</span>, a French-based boutique consulting company specialized in Open Innovation and Technology Scouting. With years of expertise in connecting businesses with the right technological solutions, we've developed an AI-powered platform that revolutionizes how B2B professionals discover and qualify suppliers. Hypsous SAS is a company incorporated in France under the registration number 888542131 RCS Paris, and headquartered in Paris, France.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experts in innovation, technology scouting, and AI-powered solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200"
              >
                {/* Avatar placeholder */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {member.name}
                </h3>

                {/* Title */}
                <p className={`text-sm font-semibold text-center mb-4 bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                  {member.title}
                </p>

                {/* Bio */}
                <p className="text-gray-600 text-sm leading-relaxed text-center">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-t border-indigo-200 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-l from-blue-300 to-indigo-400 rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Ready to Find Better Suppliers?
            </h2>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Join Hypsights today and discover how AI-powered search can transform your supplier discovery process. 🚀
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 px-8 py-4 rounded-lg text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              >
                Get started for free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 inline-flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>✨ 3 free searches included. No credit card required.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Simplified (same as landing page) */}
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

export default AboutPage;
