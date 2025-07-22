import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ 
        text: 'Password reset instructions sent to your email', 
        type: 'success' 
      });
    } catch (error: any) {
      setMessage({ 
        text: error.message || 'Failed to send reset instructions', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-hypsights-background">
      <div className="flex flex-col justify-center w-full max-w-md px-6 py-12 mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="p-8 bg-white rounded-lg shadow-md">
          {message && (
            <div 
              className={`p-4 mb-4 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 text-primary-foreground bg-primary font-semibold rounded-md shadow-sm hover:scale-105 transition duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Return to login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
