import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const EmailConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    switch (domain) {
      case 'gmail.com':
        return { name: 'Gmail', url: 'https://gmail.com' };
      case 'outlook.com':
      case 'hotmail.com':
      case 'live.com':
        return { name: 'Outlook', url: 'https://outlook.live.com' };
      case 'yahoo.com':
        return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
      case 'icloud.com':
        return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
      default:
        return null;
    }
  };

  const emailProvider = getEmailProvider(email);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-10 animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-18 h-18 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-20 animate-bounce"></div>
      </div>

      {/* Logo */}
      <div className="mb-8 z-10 relative">
        <Link to="/" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
          <span className="ml-1 text-sm text-blue-600 font-semibold">Beta</span>
        </Link>
      </div>

      {/* Main confirmation card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-xl border border-gray-100 z-10 relative">
        {/* Success icon */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Check your email! 📧
          </h1>
          
          <p className="text-gray-600 text-sm mb-6">
            We've sent a confirmation link to:
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-6">
            <p className="font-semibold text-blue-800 break-all">{email}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
              Open your email
            </h3>
            <p className="text-gray-600 text-sm">Look for an email from Hypsights in your inbox</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
              Click the confirmation link
            </h3>
            <p className="text-gray-600 text-sm">This will verify your email and activate your account</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
              Start using Hypsights
            </h3>
            <p className="text-gray-600 text-sm">You'll be redirected to your dashboard automatically</p>
          </div>
        </div>

        {/* Quick access to email provider */}
        {emailProvider && (
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Quick access to your email:</p>
            <a
              href={emailProvider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open {emailProvider.name}
            </a>
          </div>
        )}

        {/* Timer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs mb-2">
            Link expires in: <span className="font-mono font-semibold text-orange-600">{formatTime(timeLeft)}</span>
          </p>
          <p className="text-gray-400 text-xs">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800 underline">
              try signing up again
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center pt-4 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Mini KPI highlights for consistency */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center z-10 relative">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">5k+</div>
          <div className="text-xs text-gray-600">Suppliers</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">98%</div>
          <div className="text-xs text-gray-600">Success Rate</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">24h</div>
          <div className="text-xs text-gray-600">Support</div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
