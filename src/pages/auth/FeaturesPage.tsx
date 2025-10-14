import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const coreFeatures = [
    {
      icon: '📝',
      title: 'Structured Brief Creation',
      description: 'Create detailed briefs using our intuitive structured forms. Define your business needs, requirements, budget, timeline, and target criteria with precision.',
      benefits: ['Guided form workflow', 'Multi-criteria filtering', 'Industry-specific templates', 'Reference company examples'],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Assistant',
      description: 'Our intelligent AI assistant helps you refine your brief, suggests relevant solutions, and guides you through the entire search process.',
      benefits: ['Real-time chat interface', 'Solution suggestions', 'Brief refinement assistance', 'Contextual guidance'],
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      icon: '✅',
      title: 'Solution Validation System',
      description: 'Validate AI-proposed solutions before launching searches. This ensures search quality and prevents quota waste.',
      benefits: ['Manual validation control', 'Solution refinement options', 'Quality assurance', 'Quota protection'],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      icon: '⚡',
      title: 'Fast Search (Automated)',
      description: 'Get instant, AI-assessed results through our automated search system. Fast searches are quota-managed with 3 free searches included.',
      benefits: ['Automated supplier discovery', 'AI-powered matching', 'Instant results', '3 free searches included'],
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'from-indigo-50 to-blue-50'
    },
    {
      icon: '🔍',
      title: 'Deep Search (Expert Research)',
      description: 'Request unlimited manual expert research for complex needs. Our team conducts thorough investigations and provides detailed recommendations.',
      benefits: ['Expert human research', 'Unlimited requests', 'Detailed reports', 'Lead generation'],
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50'
    },
    {
      icon: '📊',
      title: 'Intelligent Scoring & Matching',
      description: 'Every supplier result includes comprehensive AI-generated scoring: solution fit, brief alignment, and criteria matching.',
      benefits: ['Multi-criteria scoring', 'AI-powered explanations', 'Relevance ranking', 'Transparent matching logic'],
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-50 to-cyan-50'
    }
  ];

  const advancedFeatures = [
    { title: 'Multi-Language Support', description: 'Interface available in multiple languages (FR/EN priority) with server-side translation management.', icon: '🌍' },
    { title: 'Brief Status Management', description: 'Track your briefs through different statuses: draft, active, and completed with clear visual indicators.', icon: '📋' },
    { title: 'Supplier Detail Pages', description: 'Access comprehensive supplier profiles with company information, product details, and contact options.', icon: '🏢' },
    { title: 'Real-time Analytics', description: 'Monitor your search activity with KPI dashboards showing solutions, suppliers, and search usage.', icon: '📈' },
    { title: 'Quota Management', description: 'Transparent quota system with visual indicators showing remaining fast searches and usage history.', icon: '💎' },
    { title: 'Export & Sharing', description: 'Export search results and share findings with your team for collaborative decision-making.', icon: '📤' }
  ];

  const workflowSteps = [
    { number: '01', title: 'Create Your Brief', description: 'Start by describing your business need using our structured form. Provide details about your requirements, budget, timeline, and target criteria.', color: 'from-blue-500 to-indigo-600' },
    { number: '02', title: 'AI Assistance', description: 'Our AI assistant analyzes your brief and suggests relevant solutions. Chat with the AI to refine your requirements and explore options.', color: 'from-purple-500 to-pink-600' },
    { number: '03', title: 'Validate Solutions', description: 'Review and validate the AI-proposed solutions. This step ensures search quality and unlocks the ability to launch searches.', color: 'from-green-500 to-emerald-600' },
    { number: '04', title: 'Launch Search', description: 'Choose between Fast Search (automated, quota-limited) or Deep Search (expert research, unlimited) based on your needs.', color: 'from-orange-500 to-red-600' },
    { number: '05', title: 'Review Results', description: 'Explore matched suppliers with AI-generated scoring and explanations. Access detailed profiles and contact information.', color: 'from-teal-500 to-cyan-600' },
    { number: '06', title: 'Connect & Decide', description: 'Export results, share with your team, and connect with selected suppliers to move forward with your project.', color: 'from-indigo-500 to-blue-600' }
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
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 transform -rotate-12 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Powerful Features for B2B Supplier Discovery
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Find & Connect</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Hypsights combines AI-powered automation with expert human research to deliver comprehensive supplier discovery solutions tailored to your specific business needs.
            </p>
            <Link to="/signup" className="inline-flex items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 px-8 py-4 rounded-lg text-base font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105">
              🚀 Start exploring features
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful tools designed to streamline your supplier discovery process from brief creation to final connection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.bgColor} border-2 border-blue-200 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 shadow-lg text-3xl`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent mb-4`}>{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A streamlined workflow that takes you from initial brief to supplier connection in six simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className={`text-6xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4 opacity-20`}>{step.number}</div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4`}>{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Additional features that enhance your supplier discovery experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100 p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Why Choose Hypsights?</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3+</div>
              <div className="text-sm text-blue-700 font-medium">🎁 Free Fast Searches</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-purple-700 font-medium">🤖 AI Assistance</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">∞</div>
              <div className="text-sm text-green-700 font-medium">🔍 Deep Search Requests</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-sm text-indigo-700 font-medium">✅ B2B Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Transform Your Supplier Discovery?</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">Join Hypsights today and experience the power of AI-assisted supplier search. Start with 3 free searches, no credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="bg-white text-indigo-600 hover:bg-gray-50 transition-all duration-300 px-8 py-4 rounded-lg text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center w-full sm:w-auto">
                🎯 Get started for free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/about" className="text-white hover:text-blue-100 border-2 border-white hover:border-blue-100 transition-all duration-200 px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center w-full sm:w-auto">
                Learn more about us
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

export default FeaturesPage;
