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
              <img src={Logo} alt="Murai logo" className="h-6 md:h-7 lg:h-8 w-auto mb-20" />
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
                    className="w-full px-5 py-3.5 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#01434A] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#01434A] text-white text-base py-3.5 px-6 rounded-full hover:bg-[#01363D] transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-[#01434A]/10 border border-[#01434A]/30 rounded-full py-3 px-6">
                  <p className="text-[#01434A] text-base">✓ You're on the waitlist!</p>
                </div>
                <p className="text-gray-600 text-sm">
                  We'll notify you when the extension is ready to download.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

    
      <div className="relative w-full h-96 flex justify-center items-center overflow-hidden">
        {/* Progressive mountain layers */}
        <div className="absolute bottom-0 left-0 w-full h-96 rounded-t-[300px] bg-gradient-to-b from-white to-[#01434A]/90"></div>
        <div className="absolute bottom-0 left-0 w-full h-80 rounded-t-[350px] bg-gradient-to-b from-white to-[#01434A]/80"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 rounded-t-[400px] bg-[#01434A]"></div>
      </div>
      
      {/* Copyright section */}
      <div className="w-full bg-[#01434A] text-center">
        <div className="flex items-center justify-center gap-6 py-4">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.592 2 12.253c0 4.522 2.865 8.355 6.839 9.709.5.098.682-.221.682-.492 0-.243-.009-.888-.014-1.744-2.782.615-3.37-1.37-3.37-1.37-.455-1.175-1.11-1.488-1.11-1.488-.907-.635.069-.622.069-.622 1.003.072 1.53 1.05 1.53 1.05.892 1.561 2.341 1.11 2.91.849.091-.663.35-1.11.636-1.366-2.222-.257-4.556-1.136-4.556-5.052 0-1.116.387-2.028 1.023-2.744-.103-.258-.444-1.296.097-2.703 0 0 .837-.27 2.744 1.047A9.33 9.33 0 0 1 12 7.51c.848.004 1.704.117 2.502.343 1.906-1.317 2.742-1.047 2.742-1.047.543 1.407.202 2.445.1 2.703.64.716 1.022 1.628 1.022 2.744 0 3.927-2.338 4.792-4.566 5.044.36.322.68.955.68 1.926 0 1.39-.013 2.51-.013 2.852 0 .273.18.593.688.492A10.012 10.012 0 0 0 22 12.253C22 6.592 17.523 2 12 2Z" clipRule="evenodd" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M4.983 3.5C4.983 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.483 1.12 2.483 2.5zM.25 8.25h4.5v15.5H.25V8.25zM8.5 8.25h4.31v2.12h.06c.6-1.14 2.07-2.35 4.26-2.35 4.56 0 5.4 3 5.4 6.9v8.83h-4.5v-7.83c0-1.87-.03-4.28-2.61-4.28-2.61 0-3.01 2.04-3.01 4.15v7.96H8.5V8.25z" />
            </svg>
          </a>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18.244 2H21.5l-7.5 8.57L23.5 22h-5.9l-4.62-5.58L7.56 22H4.3l8.04-9.19L2.5 2h6.03l4.18 5.06L18.24 2h.004zM16.96 20.4h1.64L7.12 3.5H5.38L16.96 20.4z" />
            </svg>
          </a>
        </div>
        <p className="text-white/90 text-sm font-medium pb-4">© {new Date().getFullYear()} All rights reserved.</p>
      </div>

     

    
    </div>
  );
}