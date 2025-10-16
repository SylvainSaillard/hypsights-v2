import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const betaFeatures = [
    '3 Free Fast Searches per account',
    'Unlimited Deep Search requests',
    'AI-powered assistant & chat',
    'Structured brief creation',
    'Solution validation system',
    'Intelligent supplier matching',
    'Multi-language support (FR/EN)',
    'Real-time analytics dashboard',
    'Supplier detail pages',
    'Export & sharing capabilities'
  ];

  const roadmapItems = [
    {
      phase: 'Current Beta',
      title: 'Free Access & User Feedback',
      description: 'We\'re currently in beta, offering free access to all features. Your feedback helps us shape the future of Hypsights.',
      status: 'active',
      color: 'from-green-500 to-emerald-600',
      icon: '🚀'
    },
    {
      phase: 'Phase 2',
      title: 'Feature Refinement',
      description: 'Based on user feedback, we\'ll refine existing features, improve UX, and optimize the AI matching algorithms.',
      status: 'upcoming',
      color: 'from-blue-500 to-indigo-600',
      icon: '🔧'
    },
    {
      phase: 'Phase 3',
      title: 'Premium Features',
      description: 'Introduction of advanced features and premium tiers based on validated user needs and business requirements.',
      status: 'future',
      color: 'from-purple-500 to-pink-600',
      icon: '💎'
    }
  ];

  const whyFree = [
    {
      icon: '🧪',
      title: 'Beta Testing',
      description: 'We\'re in active development and your usage helps us test and validate our platform in real-world scenarios.'
    },
    {
      icon: '💬',
      title: 'User Feedback',
      description: 'Your feedback is invaluable. We want to build features that truly matter to B2B professionals like you.'
    },
    {
      icon: '🎯',
      title: 'Agile Development',
      description: 'We iterate quickly based on user needs. Free access allows us to gather insights and improve continuously.'
    },
    {
      icon: '🤝',
      title: 'Community Building',
      description: 'We\'re building a community of early adopters who will shape the future of supplier discovery together.'
    }
  ];

  return (
    <div className="min-h-screen bg-hypsights-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      <section className="pt-20 pb-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-20 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 opacity-15 transform -rotate-12 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free During Beta
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Free Access</span> While We Build Together
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Hypsights is currently in beta and completely free to use. We're building this platform with your feedback, iterating quickly, and validating features step by step.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="inline-flex items-center bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 transition-all duration-300 px-8 py-4 rounded-lg text-base font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105">
                🎁 Start for free now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Current Beta Pricing Card */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
              Beta Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and completely free during our beta phase
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl border-4 border-green-200 p-12 relative overflow-hidden">
              {/* Beta Badge */}
              <div className="absolute top-6 right-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-3">
                  🎉 BETA ACCESS
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Free Beta Access</h3>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">$0</span>
                  <div className="ml-4 text-left">
                    <div className="text-gray-600 text-lg font-medium">per month</div>
                    <div className="text-green-600 text-sm font-semibold">During beta period</div>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                  Get full access to all features while we're in beta. No credit card required, no hidden fees, no time limits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {betaFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link to="/signup" className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 px-10 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105">
                  Get Started for Free
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Why Is Hypsights Free?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparency is important to us. Here's why we're offering free access during our beta phase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {whyFree.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4">
              Our Agile Roadmap
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building Hypsights step by step, validating each phase with real user feedback
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {roadmapItems.map((item, index) => (
              <div key={index} className={`bg-gradient-to-br ${item.status === 'active' ? 'from-green-50 to-emerald-50 border-green-200' : 'from-gray-50 to-blue-50 border-gray-200'} rounded-xl shadow-lg border-2 p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                <div className="flex items-start">
                  <div className="text-5xl mr-6">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {item.phase}
                      </span>
                      {item.status === 'active' && (
                        <span className="ml-3 text-green-600 font-semibold flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Active Now
                        </span>
                      )}
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-3`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-indigo-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How long will the beta be free?</h3>
              <p className="text-gray-600 leading-relaxed">
                We don't have a fixed end date for the beta period. We'll communicate any pricing changes well in advance and ensure early adopters are rewarded for their support and feedback.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What happens after the beta?</h3>
              <p className="text-gray-600 leading-relaxed">
                Based on user feedback and validated needs, we'll introduce premium features and pricing tiers. Early beta users will receive special benefits and preferential pricing.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Are there any limitations during beta?</h3>
              <p className="text-gray-600 leading-relaxed">
                You get 3 free Fast Searches per account to test the automated search feature. Deep Search requests (expert research) are unlimited. These quotas help us manage resources while we scale.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How can I provide feedback?</h3>
              <p className="text-gray-600 leading-relaxed">
                Your feedback is crucial! You can reach us at <a href="mailto:feedback@hypsights.com" className="text-primary hover:text-primary-dark font-semibold">feedback@hypsights.com</a> or use the feedback features within the application.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Will my data be safe?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. We take data security seriously. All your briefs, searches, and information are encrypted and stored securely. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Join Our Beta Community Today
            </h2>
            <p className="text-xl text-green-100 mb-10 leading-relaxed">
              Be part of shaping the future of B2B supplier discovery. Start using Hypsights for free and help us build something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="bg-white text-green-600 hover:bg-gray-50 transition-all duration-300 px-10 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center w-full sm:w-auto">
                🚀 Sign up for free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/features" className="text-white hover:text-green-100 border-2 border-white hover:border-green-100 transition-all duration-200 px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center w-full sm:w-auto">
                Explore all features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Contact</a></li>
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

export default PricingPage;
