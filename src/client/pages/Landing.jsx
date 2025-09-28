import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../../shared/assets/Logo.svg";
import LogoMain from "../../shared/assets/LogoMain.svg";

export default function WaitlistLandingPage() {
  const [currentTechnique, setCurrentTechnique] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [questionInput, setQuestionInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHoveringBrowser, setIsHoveringBrowser] = useState(false);
  const [isDownloadSectionVisible, setIsDownloadSectionVisible] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);
  const [isFaqVisible, setIsFaqVisible] = useState(false);
  const [isTestimonialsVisible, setIsTestimonialsVisible] = useState(false);
  const [isSeparatorVisible, setIsSeparatorVisible] = useState(false);


  const downloadSectionRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const faqRef = useRef(null);
  const testimonialsRef = useRef(null);
  const separatorRef = useRef(null);


  const flaggingTechniques = [
    {
      type: 'original',
      text: 'inappropriate',
      display: 'inappropriate',
      style: 'text-red-600 font-bold transform scale-105'
    },
    {
      type: 'blur',
      text: 'inappropriate',
      display: 'inappropriate',
      style: 'blur-sm text-gray-500 transform scale-95'
    },
    {
      type: 'asterisk',
      text: 'inappropriate',
      display: 'inappropr****',
      style: 'text-gray-700 font-mono tracking-wider transform scale-100'
    },
    {
      type: 'highlight',
      text: 'inappropriate',
      display: 'inappropriate',
      style: 'bg-yellow-300 text-black px-3 py-1 rounded-lg shadow-lg transform scale-105'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Mhark Anthony Pentinio",
      company: "VnovaTechs",
      quote: "I feel much safer letting my kids use the computer now. MURAI quietly filters harmful words without interrupting what they're doing.",
      avatar: "MP"
    },
    {
      id: 2,
      name: "Maria Santos",
      company: "Parent & Educator",
      quote: "MURAI has been amazing for keeping my kids safe online. The bilingual detection works perfectly for our Filipino-English household.",
      avatar: "MS"
    },
    {
      id: 3,
      name: "John Rodriguez",
      company: "Tech Professional",
      quote: "As a developer, I appreciate how MURAI works seamlessly in the background. It's like having a personal content moderator that understands context.",
      avatar: "JR"
    },
    {
      id: 4,
      name: "Ana Lopez",
      company: "School Administrator",
      quote: "We've implemented MURAI across our computer labs. It creates a safer digital learning environment without disrupting the educational experience.",
      avatar: "AL"
    },
    {
      id: 5,
      name: "Carlos Mendoza",
      company: "Content Creator",
      quote: "The real-time filtering is incredibly accurate. MURAI helps me maintain family-friendly content while I work on my projects.",
      avatar: "CM"
    }
  ];

  const scrollingContent = [
    { type: 'text', content: 'Welcome to our website', width: 'w-full' },
    { type: 'text', content: 'Latest news and updates', width: 'w-4/5' },
    { type: 'text', content: 'Product information', width: 'w-3/5' },
    { type: 'text', content: 'Customer testimonials', width: 'w-2/3' },
    { type: 'text', content: 'Contact us today', width: 'w-1/2' },
    { type: 'text', content: 'Special offers available', width: 'w-3/4' },
    { type: 'text', content: 'Learn more about our services', width: 'w-5/6' },
    { type: 'text', content: 'Join our community', width: 'w-2/5' },
    { type: 'text', content: 'Download our mobile app', width: 'w-4/6' },
    { type: 'text', content: 'Subscribe to newsletter', width: 'w-3/5' }
  ];

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    const q = (questionInput || '').trim();
    const email = (emailInput || '').trim();
    if (!q || !email) return;
    const subject = 'MURAI Question';
    const body = `Question: ${q}\n\nFrom: ${email}`;
    const mailto = `mailto:support@murai.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setQuestionInput('');
    setEmailInput('');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTechnique((prev) => (prev + 1) % flaggingTechniques.length);
      setAnimationKey(prev => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [flaggingTechniques.length]);

  // Intersection Observer for all sections fade-in animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observers = [];

    // Create observers for each section
    const sections = [
      { ref: heroRef, setter: setIsHeroVisible },
      { ref: featuresRef, setter: setIsFeaturesVisible },
      { ref: howItWorksRef, setter: setIsHowItWorksVisible },
      { ref: separatorRef, setter: setIsSeparatorVisible },
      { ref: faqRef, setter: setIsFaqVisible },
      { ref: testimonialsRef, setter: setIsTestimonialsVisible },
      { ref: downloadSectionRef, setter: setIsDownloadSectionVisible }
    ];

    sections.forEach(({ ref, setter }) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
          }
        },
        observerOptions
      );

      const currentRef = ref.current;
      if (currentRef) {
        observer.observe(currentRef);
        observers.push({ observer, ref: currentRef });
      }
    });

    return () => {
      observers.forEach(({ observer, ref }) => {
        observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Inter',_'system-ui',_sans-serif]">
      {/* Navigation Header */}
      <header className="w-full px-6 py-6 bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="Murai logo" className="h-10 w-auto" />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-12">
            <a
              href="#about"
              className="text-gray-700 hover:text-[#01434A] transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01434A] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-[#01434A] transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01434A] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-[#01434A] transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base relative group"
            >
              How it works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01434A] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-[#01434A] transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#01434A] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-6">
            <Link
              to="/login"
              className="text-gray-700 hover:text-[#01434A] transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#01434A] text-white px-8 py-3 rounded-full hover:bg-teal-700 transition-all duration-300 font-['Poppins',_sans-serif] font-normal text-base shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button className="text-gray-700 hover:text-[#01434A] transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main
        ref={heroRef}
        className={`flex-1 flex items-center px-6 py-16 relative overflow-hidden transition-all duration-1000 ease-out ${
          isHeroVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >


        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* Main Headline with Animation */}
              <div className={`space-y-2 transition-all duration-1200 ease-out delay-200 ${
                isHeroVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}>
                 <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-800 leading-tight tracking-tight font-['Playfair_Display',_serif]">
                   <div className="text-gray-800">
                     We detect and flag{' '}
                     <span
                       className="inline-block"
                       style={{
                         width: '13ch',
                         textAlign: 'left',
                         verticalAlign: 'baseline'
                       }}
                     >
                       <span
                         key={animationKey}
                         className={`transition-all duration-700 ease-out hover:scale-110 ${flaggingTechniques[currentTechnique].style}`}
                         style={{
                           animation: 'fadeInScale 0.7s ease-out'
                         }}
                       >
                         {flaggingTechniques[currentTechnique].display}
                       </span>
                     </span>
                   </div>
                   <div className="text-gray-800">
                     for your safety
                   </div>
                 </h1>
              </div>

              {/* Add custom CSS for animation */}
              <style jsx>{`
                @keyframes fadeInScale {
                  0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(10px);
                  }
                  50% {
                    opacity: 0.7;
                    transform: scale(1.05) translateY(-2px);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }

                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                  }
                  25% {
                    transform: translateY(-8px) rotate(1deg);
                  }
                  50% {
                    transform: translateY(-12px) rotate(0deg);
                  }
                  75% {
                    transform: translateY(-6px) rotate(-1deg);
                  }
                }

                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
              `}</style>

              {/* Description */}
              <p className={`text-md md:text-lg text-black leading-relaxed font-['Poppins',_sans-serif] font-normal transition-all duration-1200 ease-out delay-400 ${
                isHeroVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}>
                A smart browser extension that moderates inappropriate words
                in Filipino and English using real-time sentiment analysis.
              </p>

              {/* Action Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 pt-8 transition-all duration-1200 ease-out delay-600 ${
                isHeroVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}>
                <button className="group bg-[#01434A] text-white px-8 py-4 rounded-full hover:bg-teal-700 transition-all duration-300 font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    Download Extension
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </span>
                </button>
                <button className="group border-2 border-[#01434A] text-[#01434A] px-8 py-4 rounded-full hover:border-teal-700 hover:bg-teal-50 transition-all duration-300 font-medium text-lg shadow-sm hover:shadow-md transform hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    Watch Demo
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H9m0-5a1.5 1.5 0 011.5-1.5H12m-3 5h3m-3 0h.375a1.125 1.125 0 011.125 1.125V15H9V9.75A1.125 1.125 0 0110.125 8.625H12" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Side - Image/Visual Section */}
            <div className={`flex justify-center lg:justify-end transition-all duration-1200 ease-out delay-300 ${
              isHeroVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="relative">
                {/* Main Browser Mockup */}
                <div className="w-[500px] h-80 bg-gray-100 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-float">
                  {/* Browser Header */}
                  <div className="bg-gray-200 h-10 flex items-center px-6 gap-3">
                    <div className="flex gap-2">
                      <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-sm h-6 mx-6 flex items-center px-3">
                      <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                      <div className="text-sm text-gray-500">example.com</div>
                    </div>
                  </div>

                  {/* Browser Content */}
                  <div className="p-8 bg-white h-full">
                    <div className="space-y-6">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                      <div className="relative h-12">
                        <div className="h-5 bg-red-100 rounded w-2/3 relative">
                          <div className="absolute -top-10 left-0 bg-[#01434A] text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
                            Inappropriate content detected
                          </div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Floating MURAI Badge */}
                <div className="absolute -bottom-4 -right-4 bg-[#01434A] text-white px-4 py-2 rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">MURAI Active</span>
                  </div>
                </div>

                {/* Confetti-like Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-teal-200 rounded-lg rotate-12 opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-8 h-8 bg-[#01434A] rounded-full opacity-40"></div>
                <div className="absolute -top-4 -right-8 w-10 h-10 bg-teal-400 rounded-lg -rotate-12 opacity-60"></div>
                <div className="absolute top-16 -right-6 w-6 h-6 bg-teal-300 rounded-full opacity-50 animate-bounce"></div>
                <div className="absolute -bottom-6 -right-4 w-14 h-8 bg-[#01434A] rounded-xl rotate-45 opacity-30"></div>
                <div className="absolute top-32 -left-10 w-8 h-12 bg-teal-500 rounded-2xl -rotate-6 opacity-50"></div>
                <div className="absolute bottom-16 right-8 w-6 h-6 bg-teal-200 rounded-lg rotate-45 opacity-70 animate-pulse"></div>
                <div className="absolute top-8 left-12 w-4 h-4 bg-[#01434A] rounded-full opacity-60"></div>
                <div className="absolute -bottom-12 right-16 w-10 h-6 bg-teal-400 rounded-full rotate-12 opacity-40"></div>
                <div className="absolute top-48 -right-12 w-8 h-8 bg-teal-300 rounded-lg -rotate-45 opacity-50 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hero-Features Separator Section */}
      <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              {/* Left decorative line */}
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-[#01434A]"></div>

              {/* Center icon */}
              <div className="w-12 h-12 bg-[#01434A] rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Right decorative line */}
              <div className="w-32 h-px bg-gradient-to-l from-transparent via-gray-300 to-[#01434A]"></div>
            </div>
          </div>

          {/* Feature preview text */}
          <div className="text-center mt-6">
            <p className="text-gray-600 font-['Poppins',_sans-serif] text-sm tracking-wide">
              POWERFUL FEATURES
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`py-20 bg-white transition-all duration-1000 ease-out ${
          isFeaturesVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-1200 ease-out delay-200 ${
            isFeaturesVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4 font-['Playfair_Display',_serif]">
              Features
            </h2>
            <p className="text-xl text-gray-600 font-['Poppins',_sans-serif] max-w-3xl mx-auto leading-relaxed">
              Built for a Kinder Web
            </p>
          </div>

          {/* Features Grid - Top Row (3 features) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 - Real-time Filtering */}
            <div className={`text-center transition-all duration-1200 ease-out delay-400 ${
              isFeaturesVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="w-20 h-20 bg-[#01434A] rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4 font-['Poppins',_sans-serif]">
                Real-time Content Filtering
              </h3>
              <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed">
                Instantly detects and moderates inappropriate content as you browse, ensuring a safer web experience.
              </p>
            </div>

            {/* Feature 2 - Bilingual Detection */}
            <div className={`text-center transition-all duration-1200 ease-out delay-500 ${
              isFeaturesVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="w-20 h-20 bg-[#01434A] rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4 font-['Poppins',_sans-serif]">
                Bilingual Detection
              </h3>
              <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed">
                Advanced AI for Filipino and English content protection with context-aware detection.
              </p>
            </div>

            {/* Feature 3 - Customizable Settings */}
            <div className={`text-center transition-all duration-1200 ease-out delay-600 ${
              isFeaturesVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="w-20 h-20 bg-[#01434A] rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4 font-['Poppins',_sans-serif]">
                Customizable Settings
              </h3>
              <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed">
                Personalize filtering with adjustable sensitivity levels and custom preferences.
              </p>
            </div>
          </div>

          {/* Features Grid - Bottom Row (2 features) */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Feature 4 - Privacy Protection */}
            <div className={`text-center transition-all duration-1200 ease-out delay-700 ${
              isFeaturesVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="w-20 h-20 bg-[#01434A] rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4 font-['Poppins',_sans-serif]">
                Privacy Protection
              </h3>
              <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed">
                Your browsing data stays private. All filtering happens locally on your device with no data collection.
              </p>
            </div>

            {/* Feature 5 - Lightweight Performance */}
            <div className={`text-center transition-all duration-1200 ease-out delay-800 ${
              isFeaturesVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className="w-20 h-20 bg-[#01434A] rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-4 font-['Poppins',_sans-serif]">
                Lightweight & Fast
              </h3>
              <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed">
                Minimal impact on browser performance. Enjoy seamless browsing without slowdowns or interruptions.
              </p>
            </div>
          </div>


        </div>
      </section>

      {/* Features-How it Works Separator Section */}
      <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              {/* Left decorative line */}
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-[#01434A]"></div>

              {/* Center icon */}
              <div className="w-12 h-12 bg-[#01434A] rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5H9m0-5a1.5 1.5 0 011.5-1.5H12m-3 5h3m-3 0h.375a1.125 1.125 0 011.125 1.125V15H9V9.75A1.125 1.125 0 0110.125 8.625H12" />
                </svg>
              </div>

              {/* Right decorative line */}
              <div className="w-32 h-px bg-gradient-to-l from-transparent via-gray-300 to-[#01434A]"></div>
            </div>
          </div>

          {/* Section preview text */}
          <div className="text-center mt-6">
            <p className="text-gray-600 font-['Poppins',_sans-serif] text-sm tracking-wide">
              HOW IT WORKS
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        ref={howItWorksRef}
        className={`py-20 bg-white transition-all duration-1000 ease-out ${
          isHowItWorksVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex justify-between items-center mb-16 transition-all duration-1200 ease-out delay-200 ${
            isHowItWorksVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            <h2 className="text-4xl md:text-5xl font-black text-black font-['Playfair_Display',_serif]">
              How it works
            </h2>
            <p className="text-lg text-gray-600 font-['Poppins',_sans-serif]">
              Get started in just three simple steps
            </p>
          </div>

          <div className="space-y-12">
            {/* Video 1 - Install Extension */}
            <div className={`border-b border-gray-200 pb-12 overflow-hidden transition-all duration-1200 ease-out delay-400 ${
              isHowItWorksVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className={`transition-all duration-1000 ease-in-out ${
                expandedVideo === 1 ? 'grid grid-cols-2 gap-12' : 'grid grid-cols-12 gap-8'
              } items-start`}>
                {/* Video */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 1 ? 'col-span-1' : 'col-span-3'
                }`}>
                  <div className={`relative w-full bg-gray-800 rounded-lg overflow-hidden transition-all duration-1000 ease-in-out origin-bottom ${
                    expandedVideo === 1 ? 'h-80' : 'h-32'
                  }`} style={{ transformOrigin: 'bottom' }}>
                    <button
                      onClick={() => setExpandedVideo(expandedVideo === 1 ? null : 1)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      {expandedVideo === 1 ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <p className="text-white font-['Poppins',_sans-serif]">Video: Installing MURAI Extension</p>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 1 ? 'col-span-1 flex flex-col justify-center h-80' : 'col-span-9 grid grid-cols-9 gap-8 items-start'
                }`}>
                  {expandedVideo === 1 ? (
                    // Expanded content
                    <div className="space-y-6">
                      <span className="text-2xl text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/01</span>
                      <h3 className="text-5xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Install Extension</h3>
                      <p className="text-lg text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                        Add MURAI directly from the browser store — quick, easy, and lightweight. Compatible with Chrome, Firefox, and Edge browsers for seamless integration.
                      </p>
                    </div>
                  ) : (
                    // Collapsed content
                    <>
                      <div className="col-span-4">
                        <div className="space-y-2">
                          <span className="text-lg text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/01</span>
                          <h3 className="text-3xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Install Extension</h3>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                          Add MURAI directly from the browser store — quick, easy, and lightweight.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Video 2 - Activate Protection */}
            <div className={`border-b border-gray-200 pb-12 overflow-hidden transition-all duration-1200 ease-out delay-600 ${
              isHowItWorksVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className={`transition-all duration-1000 ease-in-out ${
                expandedVideo === 2 ? 'grid grid-cols-2 gap-12' : 'grid grid-cols-12 gap-8'
              } items-start`}>
                {/* Video */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 2 ? 'col-span-1' : 'col-span-3'
                }`}>
                  <div className={`relative w-full bg-gray-800 rounded-lg overflow-hidden transition-all duration-1000 ease-in-out origin-bottom ${
                    expandedVideo === 2 ? 'h-80' : 'h-32'
                  }`} style={{ transformOrigin: 'bottom' }}>
                    <button
                      onClick={() => setExpandedVideo(expandedVideo === 2 ? null : 2)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      {expandedVideo === 2 ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <p className="text-white font-['Poppins',_sans-serif]">Video: Activating Protection Settings</p>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 2 ? 'col-span-1 flex flex-col justify-center h-80' : 'col-span-9 grid grid-cols-9 gap-8 items-start'
                }`}>
                  {expandedVideo === 2 ? (
                    // Expanded content
                    <div className="space-y-6">
                      <span className="text-2xl text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/02</span>
                      <h3 className="text-5xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Activate Protection</h3>
                      <p className="text-lg text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                        Switch it on with a single click and let the smart filter take over. Configure your preferences and enable real-time content filtering with customizable sensitivity levels.
                      </p>
                    </div>
                  ) : (
                    // Collapsed content
                    <>
                      <div className="col-span-4">
                        <div className="space-y-2">
                          <span className="text-lg text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/02</span>
                          <h3 className="text-3xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Activate Protection</h3>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                          Switch it on with a single click and let the smart filter take over.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Video 3 - Browse Safely */}
            <div className={`overflow-hidden transition-all duration-1200 ease-out delay-800 ${
              isHowItWorksVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}>
              <div className={`transition-all duration-1000 ease-in-out ${
                expandedVideo === 3 ? 'grid grid-cols-2 gap-12' : 'grid grid-cols-12 gap-8'
              } items-start`}>
                {/* Video */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 3 ? 'col-span-1' : 'col-span-3'
                }`}>
                  <div className={`relative w-full bg-gray-800 rounded-lg overflow-hidden transition-all duration-1000 ease-in-out origin-bottom ${
                    expandedVideo === 3 ? 'h-80' : 'h-32'
                  }`} style={{ transformOrigin: 'bottom' }}>
                    <button
                      onClick={() => setExpandedVideo(expandedVideo === 3 ? null : 3)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      {expandedVideo === 3 ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <p className="text-white font-['Poppins',_sans-serif]">Video: Safe Browsing Experience</p>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className={`transition-all duration-1000 ease-in-out ${
                  expandedVideo === 3 ? 'col-span-1 flex flex-col justify-center h-80' : 'col-span-9 grid grid-cols-9 gap-8 items-start'
                }`}>
                  {expandedVideo === 3 ? (
                    // Expanded content
                    <div className="space-y-6">
                      <span className="text-2xl text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/03</span>
                      <h3 className="text-5xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Browse Safely</h3>
                      <p className="text-lg text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                        Enjoy real-time moderation of inappropriate words and toxic content in Filipino and English, so you can browse with confidence. Experience seamless protection that works silently in the background.
                      </p>
                    </div>
                  ) : (
                    // Collapsed content
                    <>
                      <div className="col-span-4">
                        <div className="space-y-2">
                          <span className="text-lg text-gray-400 font-['Poppins',_sans-serif] transition-all duration-500">/03</span>
                          <h3 className="text-3xl font-bold text-black font-['Poppins',_sans-serif] transition-all duration-500">Browse Safely</h3>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500">
                          Enjoy real-time moderation of inappropriate words and toxic content in Filipino and English, so you can browse with confidence.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator Section */}
      <section
        ref={separatorRef}
        className={`py-16 bg-gradient-to-b from-white via-gray-50 to-white transition-all duration-1000 ease-out ${
          isSeparatorVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-center transition-all duration-1200 ease-out delay-200 ${
            isSeparatorVisible
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
          }`}>
            <div className="flex items-center gap-8">
              {/* Left decorative line */}
              <div className={`w-24 h-px bg-gradient-to-r from-transparent to-gray-300 transition-all duration-1000 ease-out delay-300 ${
                isSeparatorVisible ? 'scale-x-100' : 'scale-x-0'
              }`}></div>

              {/* Center icon */}
              <div className={`w-12 h-12 bg-[#01434A] rounded-full flex items-center justify-center shadow-lg transition-all duration-800 ease-out delay-400 ${
                isSeparatorVisible
                  ? 'opacity-100 scale-100 rotate-0'
                  : 'opacity-0 scale-50 rotate-180'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Right decorative line */}
              <div className={`w-24 h-px bg-gradient-to-l from-transparent to-gray-300 transition-all duration-1000 ease-out delay-500 ${
                isSeparatorVisible ? 'scale-x-100' : 'scale-x-0'
              }`}></div>
            </div>
          </div>

          {/* Decorative dots */}
          <div className={`flex justify-center mt-8 transition-all duration-1200 ease-out delay-600 ${
            isSeparatorVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-[#01434A] rounded-full opacity-60 animate-pulse"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-[#01434A] rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        ref={faqRef}
        className={`py-24 bg-white transition-all duration-1000 ease-out ${
          isFaqVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Header Section */}
          <div className={`flex justify-between items-start mb-12 transition-all duration-1200 ease-out delay-200 ${
            isFaqVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-black mb-2 font-['Playfair_Display',_serif] leading-tight">
                You have question
              </h2>
              <h3 className="text-5xl md:text-6xl font-black text-black font-['Playfair_Display',_serif] leading-tight">
                We have answer
              </h3>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <div className="w-px h-8 bg-gray-300"></div>
              <p className="text-sm text-gray-400 font-['Poppins',_sans-serif]">
                Scroll to explore
              </p>
            </div>
          </div>

          {/* Border */}
          <div className="border-b border-gray-200 mb-12"></div>

          {/* Main Content Section */}
          <div className={`grid lg:grid-cols-2 gap-16 transition-all duration-1200 ease-out delay-400 ${
            isFaqVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            {/* Left side - Description */}
            <div className="border-r border-gray-200 pr-16">
              <p className="text-lg text-gray-800 font-['Poppins',_sans-serif] leading-relaxed font-medium mb-48">
                Everything you need to know about using MURAI — answered clearly and simply.
              </p>

              {/* Question Form */}
              <div className="mt-48">
                <h4 className="text-lg font-semibold text-black mb-4 font-['Poppins',_sans-serif]">
                  Still have questions?
                </h4>
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="Your question"
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
                  >
                    Send Question
                  </button>
                </form>
              </div>
            </div>

            {/* Right side - FAQ Items (Scrollable) */}
            <div className="h-[500px] p-5 overflow-y-auto pl-0 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <div className="space-y-0">
                {/* FAQ Item 1 - Expanded by default */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                    className="w-full py-6 text-left flex justify-between items-start transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      Do I need to create an account?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 1 ? 'rotate-180' : ''
                    }`}>
                      −
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        No account is needed to start using the basic version. For premium features, you may create an account to manage your settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                    className="w-full py-6 text-left flex justify-between items-center transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      Can I choose which websites to moderate?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 2 ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        Yes, you can customize which websites MURAI monitors and set different sensitivity levels for different types of content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 3 ? null : 3)}
                    className="w-full py-6 text-left flex justify-between items-center transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      Is MURAI free to use?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 3 ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        MURAI offers a free version with basic content filtering. Premium features are available with advanced customization options.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 4 ? null : 4)}
                    className="w-full py-6 text-left flex justify-between items-center transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      Is MURAI free to use?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 4 ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        Yes, MURAI is completely free to use with all core features available at no cost. We believe in making the internet safer for everyone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional FAQ items for scrolling */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 5 ? null : 5)}
                    className="w-full py-6 text-left flex justify-between items-center transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      What browsers are supported?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 5 ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 5 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        MURAI supports Chrome, Firefox, Edge, and Safari browsers with full functionality across all platforms.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === 6 ? null : 6)}
                    className="w-full py-6 text-left flex justify-between items-center transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className="font-medium text-black font-['Poppins',_sans-serif] text-lg pr-4">
                      How accurate is the content detection?
                    </span>
                    <span className={`text-gray-400 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === 6 ? 'rotate-45' : ''
                    }`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedFAQ === 6 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pb-6 px-0">
                      <p className="text-gray-600 font-['Poppins',_sans-serif] leading-relaxed text-sm">
                        Our AI-powered detection system achieves over 95% accuracy in identifying inappropriate content in both Filipino and English.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className={`py-20 text-white transition-all duration-1000 ease-out ${
          isTestimonialsVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundColor: '#003d40' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Top Section - Title and Description */}
          <div className={`flex justify-between items-start mb-12 transition-all duration-1200 ease-out delay-200 ${
            isTestimonialsVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-['Playfair_Display',_serif]">
                / Testimonials
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-xl text-white font-['Poppins',_sans-serif]">
                Trusted by parents, learners, and everyday users
              </p>
            </div>
          </div>

          {/* Border */}
          <div className="border-b border-white mb-12"></div>

          {/* Bottom Section - Testimonial Content */}
          <div className={`grid lg:grid-cols-2 gap-24 items-start transition-all duration-1200 ease-out delay-400 ${
            isTestimonialsVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            {/* Left side - User Info */}
            <div className="flex items-start gap-6 transition-all duration-500 ease-in-out">
              <div className="w-20 h-20 bg-white rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">
                  {testimonials[currentTestimonial].avatar}
                </span>
              </div>
              <div>
                <h4 className="text-2xl font-semibold text-white font-['Poppins',_sans-serif] mb-2 transition-all duration-500 ease-in-out">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-lg text-white font-['Poppins',_sans-serif] transition-all duration-500 ease-in-out">
                  {testimonials[currentTestimonial].company}
                </p>
              </div>
            </div>

            {/* Right side - Testimonial and Controls */}
            <div className="space-y-16">
              <blockquote className="text-3xl text-white font-['Poppins',_sans-serif] leading-relaxed transition-all duration-500 ease-in-out">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>

              {/* Navigation Controls - All on the right */}
              <div className="flex items-center justify-end gap-6">
                <button
                  onClick={prevTestimonial}
                  className="text-white hover:text-gray-300 transition-colors duration-200 hover:scale-110 transform"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-white font-['Poppins',_sans-serif] text-lg">
                    / {String(currentTestimonial + 1).padStart(2, '0')}
                  </span>
                  <div className="w-20 h-1 bg-white rounded">
                    <div
                      className="h-1 bg-gray-900 rounded transition-all duration-500 ease-in-out"
                      style={{ width: `${((currentTestimonial + 1) / testimonials.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={nextTestimonial}
                  className="text-white hover:text-gray-300 transition-colors duration-200 hover:scale-110 transform"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section
        ref={downloadSectionRef}
        className={`py-20 bg-white transition-all duration-1000 ease-out ${
          isDownloadSectionVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-7xl mx-auto ">
           {/* Top Text with 3-line Layout - Center Aligned */}
           <div className={`text-center transition-all duration-1200 ease-out delay-300 ${
             isDownloadSectionVisible
               ? 'opacity-100 translate-y-0'
               : 'opacity-0 translate-y-12'
           }`}>
             {/* Line 1: experience safer */}
             <h2 className="text-5xl md:text-9xl font-black text-black font-['Poppins',_sans-serif] leading-tight">
               experience <span className="italic font-['Playfair_Display',_serif]">safer</span>
             </h2>
             
             {/* Line 2: browsing + Browser Mockup */}
             <div className="flex items-center justify-center gap-8">
               <h3 className="text-5xl md:text-9xl font-black text-black font-['Poppins',_sans-serif] leading-tight">
                 <span className="italic font-['Playfair_Display',_serif]">browsing</span>
               </h3>
               
               {/* Browser Mockup */}
               <div
                 className={`w-[300px] h-[150px] bg-black rounded-2xl p-4 relative shadow-2xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
                   isDownloadSectionVisible
                     ? 'opacity-100 translate-y-0 animate-float'
                     : 'opacity-0 translate-y-8'
                 }`}
                 style={{
                   animationDelay: '600ms',
                   animationDuration: '3s',
                   animationIterationCount: 'infinite'
                 }}
                 onMouseEnter={() => setIsScrolling(true)}
                 onMouseLeave={() => setIsScrolling(false)}
               >
                 {/* Browser Window */}
                 <div className="w-full h-full bg-white rounded-lg p-3 relative overflow-hidden">
                   {/* Browser Header */}
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                     <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                   </div>

                   {/* Scrolling Content Container */}
                   <div className="relative h-full overflow-hidden">
                     <div className={`space-y-2 transition-transform duration-1000 ease-linear ${
                       isScrolling ? '-translate-y-full' : ''
                     }`}>
                       {/* Static Content */}
                       <div className="h-2 bg-gray-200 rounded w-full"></div>
                       <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                       <div className="h-2 bg-gray-200 rounded w-3/5"></div>
                       <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                       <div className="h-2 bg-gray-200 rounded w-1/2"></div>

                       {/* Additional scrolling content */}
                       {scrollingContent.slice(0, 5).map((item, index) => (
                         <div key={index} className={`h-2 bg-gray-300 rounded ${item.width} transition-all duration-300`}>
                           <div className="h-full bg-gradient-to-r from-gray-200 to-gray-400 rounded animate-pulse"></div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Cursor */}
                   <div className={`absolute bottom-6 right-6 transition-all duration-300 ${
                     isScrolling ? 'animate-bounce' : ''
                   }`}>
                     <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M13.64 21.97c-.16-.02-.3-.11-.4-.25L9.04 15.25c-.15-.22-.15-.5 0-.72.15-.22.43-.29.65-.14l4.85 3.24c.22.15.29.43.14.65-.06.09-.14.16-.24.19l-.8.5z"/>
                       <path d="M6.5 10L17.5 21 14 17.5 6.5 10z"/>
                     </svg>
                   </div>
                 </div>
               </div>
             </div>

             {/* Line 3: with MURAI */}
             <h3 className={`text-5xl md:text-9xl font-black text-black font-['Poppins',_sans-serif] leading-tight transition-all duration-1200 ease-out delay-500 ${
               isDownloadSectionVisible
                 ? 'opacity-100 translate-y-0'
                 : 'opacity-0 translate-y-12'
             }`}>
               with <span className="italic font-['Playfair_Display',_serif]">MURAI</span>
             </h3>
           </div>

          {/* Bottom Section - Download Button */}
          <div className={`flex justify-center mt-12 transition-all duration-1200 ease-out delay-700 ${
            isDownloadSectionVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}>
            <button className="bg-black text-white px-12 py-6 rounded-full hover:bg-gray-800 transition-all duration-300 font-medium text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 font-['Poppins',_sans-serif] min-w-[300px]">
              Download Murai
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-12 items-start">

            {/* Logo Section */}
            <div className="flex flex-col items-start">
              {/* Logo Main */}
              <div className="">
                <img src={LogoMain} alt="MURAI Logo" className="h-30 w-auto" />
              </div>
              
            </div>

            {/* Links Section */}
            <div>
              <h3 className="text-2xl font-medium mb-6 font-['Poppins',_sans-serif]" style={{ color: '#01434A' }}>
                / Links
              </h3>
              <ul className="space-y-3 font-['Poppins',_sans-serif]">
                <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-base">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-base">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-base">How it Works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-base">Download Extension (or "Get MURAI")</a></li>
              </ul>
            </div>

            {/* Get in Touch Section */}
            <div>
              <h3 className="text-2xl font-medium mb-6 font-['Poppins',_sans-serif]" style={{ color: '#01434A' }}>
                / Get in touch
              </h3>
              <div className="space-y-4 font-['Poppins',_sans-serif]">
                <div>
                  <p className="text-gray-600 text-base">support@murai.ai</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600 text-base">Lipa City, Philippines</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-gray-600 text-base">+ 639502430571</p>
                </div>
              </div>

              {/* Privacy Policy and Terms */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex gap-6 text-sm">
                  <a href="#" className="text-gray-600 hover:text-black transition-colors font-['Poppins',_sans-serif]">Privacy Policy</a>
                  <span className="text-gray-400">|</span>
                  <a href="#" className="text-gray-600 hover:text-black transition-colors font-['Poppins',_sans-serif]">Terms of Use</a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-500 font-['Poppins',_sans-serif] text-sm">
              Copyright © 2025 , MURAi.ai, All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}