import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Use login from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password); // Call the actual login function
      navigate('/dashboard'); // Navigate to dashboard on successful login
    } catch (err) {
      setError((err as Error).message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-15 transform animate-bounce"></div>
      </div>
      
      <div className="w-full max-w-md z-10 relative">
        {/* Logo and branding */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="text-3xl font-bold text-gray-900">Hypsights</span>
            <span className="ml-1 text-sm text-blue-600 font-semibold">v2</span>
          </Link>
        </div>
        
        {/* Login card with enhanced styling */}
        <div className="bg-white p-8 space-y-6 rounded-xl shadow-2xl border border-gray-100">
          {/* Back to home button */}
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Login to Hypsights
            </h1>
            <p className="text-gray-600 text-sm">👋 Welcome back! Ready to find amazing suppliers?</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link to="/reset-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 hover:from-indigo-600 hover:via-blue-600 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <>
                    🔑 Login
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="pt-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                Sign up 🚀
              </Link>
            </p>
          </div>
          
          {/* Features highlight */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="text-xs text-gray-500">
                <div className="text-blue-600 font-semibold">3+</div>
                <div>Free searches</div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="text-purple-600 font-semibold">24/7</div>
                <div>AI assistance</div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="text-green-600 font-semibold">100%</div>
                <div>Expert validation</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Hypsights. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
