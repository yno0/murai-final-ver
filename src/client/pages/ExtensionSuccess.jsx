import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiChrome } from 'react-icons/fi';
import Logo from "../../shared/assets/LogoMain.svg";

export default function ExtensionSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/client/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate('/client/dashboard');
  };

  const handleOpenExtension = () => {
    // Try to focus on the extension icon (this won't work programmatically, but we can show instructions)
    alert('Please click the MURAi extension icon in your browser toolbar to access your settings!');
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden font-['Inter']">
      <div className="w-full lg:w-full bg-white px-5 sm:px-8 md:px-12 xl:px-16 py-6 sm:py-8 flex flex-col">
        <div className="pt-4 sm:pt-6 flex justify-center">
          <img src={Logo} alt="Logo" className="w-30 h-12 object-contain" />
        </div>

        <div className="flex-grow flex items-start sm:items-center justify-center px-3 sm:px-4">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border-gray-100 mb-6 sm:mb-8">
            <div className="space-y-2 mb-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-[40px] font-semibold font-['Playfair_Display']">Login Successful!</h1>
              <p className="text-gray-600 text-sm">You're now logged in to MURAi! Your extension settings are now available.</p>
            </div>

            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm mb-6">
              Click the MURAi extension icon in your browser toolbar to access your customize settings.
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleOpenExtension}
                className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
              >
                <FiChrome className="w-5 h-5 mr-2" />
                Open Extension Settings
              </button>

              <button
                onClick={handleGoToDashboard}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                <FiArrowRight className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>
            </div>

            {/* Auto-redirect notice */}
            <div className="mt-6 text-sm text-gray-500 text-center">
              Redirecting to dashboard in {countdown} seconds...
            </div>

            {/* Extension Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                How to access your extension:
              </h3>
              <ol className="text-xs text-blue-800 space-y-1 text-left">
                <li>1. Look for the MURAi extension icon in your browser toolbar</li>
                <li>2. Click on the extension icon</li>
                <li>3. Customize your content moderation settings</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="py-6 sm:py-8">
          <p className="text-xs text-gray-500 text-center px-4">
            Need help? <a href="/support" className="underline hover:text-gray-700">Contact our support team</a> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
