import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Logo from "../../shared/assets/LogoMain.svg";
import authService from '../services/authService.js';
import { ToastProvider, useToastContext } from '../contexts/ToastContext.jsx';

import GoogleAuthButton from '../components/GoogleAuthButton.jsx';

function LoginForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFromExtension, setIsFromExtension] = useState(false);
    const toast = useToastContext();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Check if user is coming from the extension or invitation
    useEffect(() => {
        const fromExtension = searchParams.get('from') === 'extension' ||
                             document.referrer.includes('chrome-extension://') ||
                             window.location.href.includes('from=extension');
        setIsFromExtension(fromExtension);


    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.login(formData);

            if (response.success) {
                toast.success('Login successful!');
                // Add a small delay to let the user see the success toast
                setTimeout(() => {
                    if (isFromExtension) {
                        // Redirect to extension success page
                        navigate('/extension-success');
                    } else {
                        // Redirect to dashboard for normal login
                        navigate('/client/dashboard');
                    }
                }, 1500); // 1.5 second delay
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="flex h-screen w-full font-['Inter']">
            <div className="hidden lg:block w-1/2 h-full relative overflow-hidden">
                <div className="absolute inset-2 rounded-2xl  transform transition-all duration-500 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800"></div>
                    
                </div>
            </div>

            <div className="w-full lg:w-1/2 h-full bg-white px-8 md:px-16 xl:px-24 flex flex-col">
                <div className="pt-8 pb-16 flex justify-center">
                    <Link to="/">
                        <img src={Logo} alt="Logo" className="w-18 h-12 object-contain hover:opacity-80 transition-opacity" />
                    </Link>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="space-y-4 mb-8 text-center">
                            <h1 className="text-5xl font-medium text-black-900 font-['Playfair_Display']">Welcome back</h1>
                            <p className="text-gray-600">Please enter your credentials to continue</p>
                          
                        </div>

                        {/* Extension notice */}
                        {isFromExtension && (
                            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-teal-800">
                                            MURAi Extension Login
                                        </h3>
                                        <p className="text-sm text-teal-700 mt-1">
                                            After logging in, your extension settings will be automatically available. 
                                            The extension popup will open with your customize settings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                                                 <a href="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded">
                                    Forgot password?
                                </a>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                                                <GoogleAuthButton text="Sign in with Google" />
                            </div>
                        </form>
                    </div>
                </div>
                <div className="py-8 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                                                         <a href="/register" className="font-medium text-teal-600 hover:text-teal-700">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <ToastProvider>
            <LoginForm />
        </ToastProvider>
    );
}