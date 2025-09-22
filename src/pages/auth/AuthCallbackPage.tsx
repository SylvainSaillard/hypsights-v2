import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AuthCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Log all URL parameters for debugging
        console.log('All URL parameters:', Object.fromEntries(searchParams.entries()));
        console.log('Hash parameters:', window.location.hash);
        
        // Check for errors in URL first (from Supabase)
        const error_code = searchParams.get('error_code');
        const error_description = searchParams.get('error_description');
        
        // Also check hash parameters (sometimes Supabase puts errors there)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error_code') || hashParams.get('error');
        const hashErrorDesc = hashParams.get('error_description');
        
        if (error_code || hashError) {
          let errorMessage = 'Failed to confirm account.';
          const actualErrorCode = error_code || hashError;
          const actualErrorDesc = error_description || hashErrorDesc;
          
          console.log('Error detected:', { actualErrorCode, actualErrorDesc });
          
          switch (actualErrorCode) {
            case 'otp_expired':
              errorMessage = 'The confirmation link has expired. This might indicate a configuration issue. Please try signing up again and click the link immediately.';
              break;
            case 'access_denied':
              errorMessage = 'Access denied. The confirmation link may be invalid or expired.';
              break;
            default:
              errorMessage = actualErrorDesc ? decodeURIComponent(actualErrorDesc) : 'An error occurred during confirmation.';
          }
          
          throw new Error(errorMessage);
        }

        // Get the tokens from the URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        if (token_hash && type) {
          // Handle email confirmation
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setSuccess(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } else if (access_token && refresh_token) {
          // Handle session from URL (fallback)
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setSuccess(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } else {
          throw new Error('Invalid confirmation link. Please try signing up again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError((err as Error).message || 'Failed to confirm account. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming your account...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmation Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your email has been successfully verified. Redirecting to your dashboard...</p>
          <div className="animate-pulse text-blue-600">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
