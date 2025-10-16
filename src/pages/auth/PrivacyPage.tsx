import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your Privacy Matters
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Privacy <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We are committed to protecting your personal data and respecting your privacy
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-blue-200 p-8 md:p-12">
            
            {/* Effective Date */}
            <div className="mb-8 pb-8 border-b border-blue-200">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">This policy is effective as of 2025.</span>
              </p>
            </div>

            {/* Company Information */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Company Information
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Hypsous SAS</span> is a company incorporated in France under the registration number <span className="font-semibold">888542131 RCS Paris</span>, and headquartered at:
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-gray-800 font-medium">
                    13bis, rue Campagne-Première<br />
                    75014 Paris, France
                  </p>
                </div>
                <p className="text-gray-700 mt-4">
                  Hypsous SAS owns and operates <span className="font-semibold">Hypsights</span>, an AI-Assisted Search Service for B2B professionals, whose website is at <a href="https://www.hypsights.com" className="text-primary hover:text-primary-dark font-semibold underline">www.hypsights.com</a>.
                </p>
              </div>
            </div>

            {/* Our Commitment */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Our Commitment to Data Protection
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  At Hypsous, we commit to a high standard of data protection. This policy applies to all our data processing operations under Hypsous and Hypsights, whether through our websites, our systems, or our commercial endeavours.
                </p>
              </div>
            </div>

            {/* Data Collection */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                What Data We Collect
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 mb-4">
                  We only collect your personal data when we truly need it to provide a service to you, including the following:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Your name</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Your email address</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Your job role</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal Basis */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Legal Basis for Processing
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  We rely on the legal basis of <span className="font-semibold">legitimate interest</span> in order to engage in commercial relationships with you and provide services to you. We may also rely on your <span className="font-semibold">consent</span> for some activities.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Data Retention
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  We only retain collected personal data for as long as necessary to provide you with your requested service. We delete your personal data as soon as we do not need it for any purpose anymore.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Data Security
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  We use industry standard methods and every reasonable effort possible to ensure that your personal data is safe, including protection against unlawful disclosure, access, or tampering.
                </p>
              </div>
            </div>

            {/* External Links */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                External Links
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites and cannot accept responsibility or liability for their respective privacy policies.
                </p>
              </div>
            </div>

            {/* Third Party Providers */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Third Party Providers
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <p className="text-gray-700 leading-relaxed">
                  We use third party providers in order to provide services to you; within the scope of those services, we may transfer personal data to such third-party providers, which may be located outside of the European Economic Area (EEA).
                </p>
              </div>
            </div>

            {/* Important Notices */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Important Notices
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">We <span className="font-semibold">do not sell</span> your personal data.</p>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">We <span className="font-semibold">do not process</span> personal data of children under the age of 18.</p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Your Rights
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Should we use consent as a legal basis to process your personal data, you are free to <span className="font-semibold">withdraw said consent at any time</span>, by contacting us.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are a resident in the <span className="font-semibold">EEA</span>, or the state of <span className="font-semibold">California</span>, you have certain rights towards your personal data, including a right of <span className="font-semibold">access, rectification, and deletion</span>. Please reach out to us in order to have your rights enforced.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-8 border-2 border-blue-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Questions or Concerns?
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about how we handle your personal data, feel free to contact us.
              </p>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Privacy Contact:</span>
                </p>
                <a href="mailto:patrick.ferran@hypsous.com" className="text-lg font-bold text-primary hover:text-primary-dark transition-colors duration-200">
                  patrick.ferran@hypsous.com
                </a>
              </div>
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

export default PrivacyPage;
