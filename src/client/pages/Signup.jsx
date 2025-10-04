import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Logo from "../../shared/assets/LogoMain.svg";
import authService from '../services/authService.js';

import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'personal'
  });



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { name, email, password, plan } = formData;
      const response = await authService.register({
        name,
        email,
        password,
        plan
      });

      if (response.success) {
        // Redirect based on plan
        if (plan === 'personal') {
          navigate('/client/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modal content
  const modalContent = {
    codeOfConduct: {
      title: "Code of Conduct",
      content: `
        <h3 class="text-lg font-semibold mb-4">Our Commitment</h3>
        <p class="mb-4">We are committed to providing a welcoming and inclusive environment for all users. This Code of Conduct outlines our expectations for behavior and the consequences for unacceptable behavior.</p>
        
        <h3 class="text-lg font-semibold mb-4">Expected Behavior</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Be respectful and inclusive in all interactions</li>
          <li>Use welcoming and inclusive language</li>
          <li>Be respectful of differing viewpoints and experiences</li>
          <li>Accept constructive criticism gracefully</li>
          <li>Focus on what is best for the community</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-4">Unacceptable Behavior</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Harassment, discrimination, or intimidation</li>
          <li>Inappropriate or offensive language or imagery</li>
          <li>Personal attacks or trolling</li>
          <li>Spam or unsolicited commercial content</li>
          <li>Violation of privacy or sharing personal information</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-4">Consequences</h3>
        <p class="mb-4">Violations of this Code of Conduct may result in warnings, temporary suspension, or permanent ban from our platform.</p>
      `
    },
    termsOfService: {
      title: "Terms of Service",
      content: `
        <h3 class="text-lg font-semibold mb-4">Acceptance of Terms</h3>
        <p class="mb-4">By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3 class="text-lg font-semibold mb-4">Use License</h3>
        <p class="mb-4">Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p>
        
        <h3 class="text-lg font-semibold mb-4">User Accounts</h3>
        <p class="mb-4">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        
        <h3 class="text-lg font-semibold mb-4">Prohibited Uses</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Use our service for any unlawful purpose</li>
          <li>Transmit any harmful or malicious code</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with the proper functioning of our service</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-4">Limitation of Liability</h3>
        <p class="mb-4">In no event shall our company be liable for any damages arising out of the use or inability to use our service.</p>
      `
    },
    privacyPolicy: {
      title: "Privacy Policy",
      content: `
        <h3 class="text-lg font-semibold mb-4">Information We Collect</h3>
        <p class="mb-4">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
        
        <h3 class="text-lg font-semibold mb-4">How We Use Your Information</h3>
        <ul class="list-disc pl-6 mb-4 space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-4">Information Sharing</h3>
        <p class="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
        
        <h3 class="text-lg font-semibold mb-4">Data Security</h3>
        <p class="mb-4">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h3 class="text-lg font-semibold mb-4">Your Rights</h3>
        <p class="mb-4">You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
      `
    }
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="flex justify-end p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

    return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4 font-['Inter']">

      {/* Top logo and heading outside the card */}
      <div className="w-full max-w-lg text-center">
        <div className=" flex justify-center">
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-18 h-12 object-contain hover:opacity-80 transition-opacity" />
          </Link>
        </div>
        <h1 className="text-xl md:text-[35px] font-medium text-black-900 font-['Playfair_Display']">Create your profile</h1>
      </div>

      <div className="w-full max-w-lg  rounded-2xl p-6 md:p-8">

        <div className="mb-2 text-center">
        </div>

            <GoogleAuthButton text="Continue with Google" />

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all duration-200"
                  placeholder="you@youremail.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all duration-200"
                    placeholder="At least 8 characters."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all duration-200"
                    placeholder="Re-type password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Profile...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </button>
                <p className="text-xs text-gray-500 leading-relaxed text-center">
                  By clicking "Create Profile" you agree to our <button type="button" onClick={() => openModal('codeOfConduct')} className="underline hover:text-teal-700">Code of Conduct</button>,
                  <button type="button" onClick={() => openModal('termsOfService')} className="underline hover:text-teal-700"> Terms of Service</button> and
                  <button type="button" onClick={() => openModal('privacyPolicy')} className="underline hover:text-teal-700"> Privacy Policy</button>.
                </p>
              </div>
            </form>
          </div>
      {/* Bottom prompt outside the card */}
      <div className="w-full max-w-lg text-center mt-1">
        <p className="text-sm text-gray-600">Already have a profile? <a href="/login" className="font-medium text-teal-600 hover:text-teal-700">Log in</a></p>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'codeOfConduct'}
        onClose={closeModal}
        title={modalContent.codeOfConduct.title}
        content={modalContent.codeOfConduct.content}
      />
      <Modal
        isOpen={activeModal === 'termsOfService'}
        onClose={closeModal}
        title={modalContent.termsOfService.title}
        content={modalContent.termsOfService.content}
      />
      <Modal
        isOpen={activeModal === 'privacyPolicy'}
        onClose={closeModal}
        title={modalContent.privacyPolicy.title}
        content={modalContent.privacyPolicy.content}
      />
    </div>
  );
}
