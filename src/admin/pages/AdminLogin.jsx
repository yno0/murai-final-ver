import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import LogoMain from '../../shared/assets/LogoMain.svg';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { AdminToastProvider, useAdminToastContext } from '../contexts/ToastContext.jsx';

function AdminLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const toast = useAdminToastContext();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any existing toasts when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate admin user
      await login(formData.email, formData.password);

      toast.success('Login successful!');
      // Add a small delay to let the user see the success toast
      setTimeout(() => {
        // Redirect to admin dashboard
        navigate('/admin/dashboard/overview');
      }, 1500); // 1.5 second delay
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-['Inter']">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link to="/">
            <img src={LogoMain} alt="MURAI Logo" className="h-12 w-auto hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium text-black font-['Playfair_Display'] mb-4">Admin Portal</h1>
          <p className="text-gray-600">Sign in to access the MURAi admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-all duration-200"
              placeholder="Enter your admin email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#015763] hover:bg-[#023a42] focus:outline-none focus:ring-2 focus:ring-[#015763]/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Signing in...
              </>
            ) : (
              'Sign In to Admin Portal'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Demo Credentials
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> murai@admin.com</p>
            <p><strong>Password:</strong> muraitestadmin123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2024 MURAi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <AdminToastProvider>
      <AdminLoginForm />
    </AdminToastProvider>
  );
}
