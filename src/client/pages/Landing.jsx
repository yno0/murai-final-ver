import * as React from "react";
import { useState } from "react";
import Logo from "../../shared/assets/Logo.svg";

export default function WaitlistLandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setIsSubmitted(true);
      // Here you would normally send the email to your backend
      console.log("Email submitted:", email);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-8 md:py-10 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-1">
            <div className="flex justify-center">
              <img src={Logo} alt="Murai logo" className="h-6 md:h-7 lg:h-8 w-auto mb-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
              Browse with care
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
              Just one click away
            </h2>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto pt-4">
            A smart browser extension that moderates inappropriate words in
            Filipino and English using real-time sentiment analysis.
          </p>

          <div className="pt-6">
            
            {!isSubmitted ? (
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 py-3.5 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#015763] text-white text-base py-3.5 px-6 rounded-full hover:bg-[#014b56] transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-[#015763]/10 border border-[#015763]/30 rounded-full py-3 px-6">
                  <p className="text-[#015763] text-base">✓ You're on the waitlist!</p>
                </div>
                <p className="text-gray-600 text-sm">
                  We'll notify you when the extension is ready to download.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <div className="relative w-full h-96 flex justify-center items-end mb-0 mt-0 z-10 overflow-hidden pointer-events-none">
        
        {/* Progressive layers all touching the same ground */}
        {/* Back (tallest) */}
        <div className="absolute bottom-0 left-0 w-full h-96 rounded-t-[300px] bg-gradient-to-b from-white to-[#015763]/90"></div>
        {/* Middle (white to teal gradient) */}
        <div className="absolute bottom-0 left-0 w-full h-80 rounded-t-[350px] bg-gradient-to-b from-white to-[#015763]/80"></div>
        {/* Front (smallest) */}
        <div className="absolute bottom-0 left-0 w-full h-64 rounded-t-[400px] bg-black/90"></div>      </div>

    
    </div>
  );
}