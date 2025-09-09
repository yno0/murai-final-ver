import React, { useState } from 'react'
import Logo from "../../shared/assets/Logo.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: integrate with API to send reset link
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden lg:block w-1/2 h-full relative overflow-hidden">
        <div className="absolute inset-2 rounded-2xl transform transition-all duration-500 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800"></div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full bg-white px-6 md:px-12 xl:px-16 flex flex-col">
        <div className="pt-6 pb-8 flex justify-center">
          <img src={Logo} alt="Logo" className="w-30 h-12 object-contain" />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="space-y-2 mb-6 text-center">
              <h1 className="text-3xl font-medium">Forgot password</h1>
              <p className="text-gray-600 text-sm">Enter your email to receive a reset link</p>
            </div>

            {sent ? (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm mb-6">
                If an account exists for {email}, we sent a reset link.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg bg-teal-600 text-white font-medium transition ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700'}`}
              >
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-6 text-center">
              Remembered it? <a href="/login" className="font-medium text-teal-600 hover:text-teal-700">Back to login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


