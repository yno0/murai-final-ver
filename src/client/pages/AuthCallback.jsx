import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import authService from '../services/authService.js';
import { getGoogleCallbackParams } from '../utils/googleAuth.js';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const { token, success, error } = getGoogleCallbackParams();

        if (error) {
          setError('Authentication failed. Please try again.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (success === 'true' && token) {
          // Store the token
          localStorage.setItem('token', token);
          
          // Get user data
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              setStatus('success');
              navigate('/client/dashboard');
            } else {
              throw new Error('Failed to get user data');
            }
          } catch (userError) {
            console.error('Error getting user data:', userError);
            setError('Authentication successful but failed to load user data.');
            setStatus('error');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          setError('Invalid authentication response.');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setError('Authentication failed. Please try again.');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    // Redirect immediately without showing success UI
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication failed
        </h2>
        <p className="text-gray-600 mb-4">
          {error || 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}