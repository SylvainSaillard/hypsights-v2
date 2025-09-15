import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth(); // Use signup from AuthContext // Keep navigate for potential future use

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) { // Supabase default minimum password length
        setError("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);
    try {
      await signup(email, password); // Call the actual signup function
      // Check Supabase Auth settings: if "Confirm email" is ON, user needs to confirm.
      // If "Confirm email" is OFF, user is logged in immediately.
      setMessage(
        'Signup successful! If email confirmation is required, please check your email to confirm your account. You can then log in.'
      );
      // setEmail(''); // Optionally clear fields
      // setPassword('');
      // setConfirmPassword('');
      // navigate('/login'); // Or redirect to a page that says "check your email"
    } catch (err) {
      setError((err as Error).message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-15 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"></div>
      </div>
      
      {/* Logo */}
      <div className="mb-8 z-10 relative">
        <Link to="/" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-2xl font-bold text-gray-900">Hypsights</span>
          <span className="ml-1 text-sm text-blue-600 font-semibold">v2</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-xl border border-gray-100 z-10 relative">
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Create your Hypsights Account
          </h1>
          <p className="text-gray-600 text-sm">🚀 Join thousands of professionals finding better suppliers</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 sm:text-sm"
              placeholder="•••••••• (min. 6 characters)"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
              placeholder="••••••••"
            />
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
          {message && (
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  🚀 Sign Up
                </>
              )}
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200">
            Log in 👋
          </Link>
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
    </div>
  );
};

export default SignupPage;
