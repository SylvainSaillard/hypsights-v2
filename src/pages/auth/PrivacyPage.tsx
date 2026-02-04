import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
              <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/about" className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium">Contact</Link>
              <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium shadow-md">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-blue-100">Your privacy is important to us</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

            {/* Last Updated */}
            <div className="mb-10 pb-6 border-b-2 border-gray-200">
              <p className="text-sm text-gray-600 font-semibold">
                Last Updated: <span className="text-primary">Feb 4, 2026</span>
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-10">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-primary">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Hypsous is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our services, including the Hypsights platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                1. Who is responsible for your personal data?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-semibold">Hypsous SAS</span> is the data controller responsible for your personal data.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2"><span className="font-semibold">Company:</span> Hypsous SAS</p>
                  <p className="text-gray-700 mb-2"><span className="font-semibold">Address:</span> 128 rue de la Boétie, 75008 Paris, France</p>
                  <p className="text-gray-700 mb-2"><span className="font-semibold">SIRET:</span> 90481041600015</p>
                  <p className="text-gray-700 mb-2"><span className="font-semibold">Website:</span> <a href="https://www.hypsous.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors">www.hypsous.com</a></p>
                  <p className="text-gray-700"><span className="font-semibold">Contact:</span> <a href="mailto:patrick.ferran@hypsous.com" className="text-primary hover:text-primary-dark transition-colors">patrick.ferran@hypsous.com</a></p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                2. What personal data do we collect?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 mb-6">We collect the following types of personal data:</p>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Account Information
                    </h3>
                    <p className="text-gray-700 text-sm">Name, email address, company name, job title, and password when you create an account.</p>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Profile Information
                    </h3>
                    <p className="text-gray-700 text-sm">Professional information you choose to provide, such as industry, company size, and areas of interest.</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Usage Data
                    </h3>
                    <p className="text-gray-700 text-sm">Information about how you interact with our services, including search queries, briefs created, and features used.</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                      Technical Data
                    </h3>
                    <p className="text-gray-700 text-sm">IP address, browser type, device information, and cookies for security and service improvement.</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                      Communication Data
                    </h3>
                    <p className="text-gray-700 text-sm">Records of your correspondence with us, including support requests and feedback.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                3. How do we use your personal data?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 mb-4">We use your personal data for the following purposes:</p>
                <ul className="space-y-3">
                  {[
                    'To provide and maintain our services',
                    'To process and manage your account',
                    'To respond to your inquiries and provide customer support',
                    'To send you service-related communications',
                    'To improve and personalize our services',
                    'To analyze usage patterns and optimize user experience',
                    'To detect, prevent, and address technical issues or fraud',
                    'To comply with legal obligations'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                4. What is the legal basis for processing your data?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 mb-4">We process your personal data based on the following legal grounds:</p>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800">Contract Performance</h3>
                    <p className="text-gray-600 text-sm">Processing necessary to provide our services to you.</p>
                  </div>
                  <div className="border-l-4 border-indigo-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800">Legitimate Interest</h3>
                    <p className="text-gray-600 text-sm">Processing necessary for our legitimate business interests, such as improving our services and marketing.</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800">Consent</h3>
                    <p className="text-gray-600 text-sm">Where you have given explicit consent for specific processing activities.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800">Legal Obligation</h3>
                    <p className="text-gray-600 text-sm">Processing necessary to comply with applicable laws and regulations.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                5. Who do we share your data with?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 mb-4">We may share your personal data with:</p>
                <ul className="space-y-3">
                  {[
                    { title: 'Service Providers', desc: 'Third-party vendors who help us operate our services (hosting, analytics, customer support).' },
                    { title: 'Business Partners', desc: 'Partners involved in delivering joint services or offerings.' },
                    { title: 'Legal Authorities', desc: 'When required by law or to protect our rights.' },
                    { title: 'Corporate Transactions', desc: 'In connection with mergers, acquisitions, or asset sales.' }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-semibold text-gray-800">{item.title}:</span>
                        <span className="text-gray-600 ml-1">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Note:</span> We do not sell your personal data to third parties.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                6. International data transfers
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your data may be transferred to and processed in countries outside the European Economic Area (EEA). When we transfer your data internationally, we ensure appropriate safeguards are in place, such as:
                </p>
                <ul className="space-y-2">
                  {[
                    'Standard Contractual Clauses approved by the European Commission',
                    'Adequacy decisions by the European Commission',
                    'Binding Corporate Rules where applicable'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                7. How long do we keep your data?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including:
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    'For the duration of your account and our business relationship',
                    'As required by applicable laws and regulations',
                    'To resolve disputes and enforce our agreements'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  When your data is no longer needed, we will securely delete or anonymize it.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                8. How do we protect your data?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your personal data, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '🔐', title: 'Encryption', desc: 'Data encryption in transit and at rest' },
                    { icon: '🔒', title: 'Access Controls', desc: 'Strict access controls and authentication' },
                    { icon: '🛡️', title: 'Security Audits', desc: 'Regular security assessments and audits' },
                    { icon: '👥', title: 'Staff Training', desc: 'Employee training on data protection' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{item.icon}</span>
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                9. What are your rights?
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under the GDPR and applicable French law, you have the following rights regarding your personal data:
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'Right of Access', desc: 'Request a copy of your personal data' },
                    { title: 'Right to Rectification', desc: 'Request correction of inaccurate data' },
                    { title: 'Right to Erasure', desc: 'Request deletion of your data ("right to be forgotten")' },
                    { title: 'Right to Restriction', desc: 'Request limitation of data processing' },
                    { title: 'Right to Data Portability', desc: 'Receive your data in a structured, machine-readable format' },
                    { title: 'Right to Object', desc: 'Object to processing based on legitimate interests' },
                    { title: 'Right to Withdraw Consent', desc: 'Withdraw consent at any time where processing is based on consent' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-semibold text-gray-800">{item.title}:</span>
                        <span className="text-gray-600 ml-1">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700 text-sm">
                    To exercise any of these rights, please contact us at{' '}
                    <a href="mailto:patrick.ferran@hypsous.com" className="text-primary hover:text-primary-dark font-semibold">
                      patrick.ferran@hypsous.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 10 - Cookies */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                10. Cookies and tracking technologies
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-6">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. Here's how we use them:
                </p>
                
                {/* Cookies Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">Cookie Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Purpose</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold rounded-tr-lg">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 bg-white">
                        <td className="px-4 py-3 font-medium text-gray-800">Essential</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Required for basic site functionality</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Session</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">Analytics</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Help us understand how visitors use our site</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Up to 2 years</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-white">
                        <td className="px-4 py-3 font-medium text-gray-800">Functional</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Remember your preferences</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Up to 1 year</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800 rounded-bl-lg">Marketing</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">Deliver relevant advertisements</td>
                        <td className="px-4 py-3 text-gray-600 text-sm rounded-br-lg">Up to 2 years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-semibold">Managing Cookies:</span> You can control and manage cookies through your browser settings. Here are links to manage cookies in popular browsers:
                </p>
                <ul className="space-y-2">
                  {[
                    { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                    { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies' },
                    { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies' },
                    { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/cookies' }
                  ].map((browser, index) => (
                    <li key={index}>
                      <a href={browser.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        {browser.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 11 - Third Party Services */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                11. Third-party services
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use third-party services to help operate and improve our platform. These include:
                </p>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Google Analytics</h3>
                    <p className="text-gray-600 text-sm mb-2">For website traffic analysis and user behavior insights.</p>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      Google Privacy Policy
                    </a>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Opt-out:</span> You can opt out of Google Analytics by installing the{' '}
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                        Google Analytics Opt-out Browser Add-on
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 12 - Children */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                12. Children's privacy
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from children. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 13 - Updates */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                13. Changes to this Privacy Policy
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>

            {/* Section 14 - Contact & Complaints */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-8 border-2 border-blue-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                14. Contact us
              </h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Privacy Contact:</span>
                </p>
                <a href="mailto:patrick.ferran@hypsous.com" className="text-lg font-bold text-primary hover:text-primary-dark transition-colors duration-200">
                  patrick.ferran@hypsous.com
                </a>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                <h3 className="font-semibold text-gray-800 mb-2">Right to Lodge a Complaint</h3>
                <p className="text-gray-700 text-sm">
                  If you believe your data protection rights have been violated, you have the right to lodge a complaint with the French supervisory authority:{' '}
                  <a href="https://www.cnil.fr/en" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark font-semibold">
                    CNIL (Commission Nationale de l'Informatique et des Libertés)
                  </a>
                </p>
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
                <li><Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-primary transition-colors duration-200 text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Hypsous SAS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
