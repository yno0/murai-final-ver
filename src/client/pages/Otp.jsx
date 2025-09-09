import React, { useRef, useState } from 'react'

export default function Otp() {
  const inputsRef = Array.from({ length: 6 }, () => useRef(null));
  const [values, setValues] = useState(Array(6).fill(''));
  const [isSending, setIsSending] = useState(false);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...values];
    next[index] = value;
    setValues(next);

    if (value && index < 5) {
      inputsRef[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef[index - 1].current?.focus();
    }
  };

  const code = values.join('');

  const handleResend = async () => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSending(false);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    // TODO: verify OTP
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Verify code</h1>
          <p className="text-gray-600 mt-1">Enter the 6-digit code we sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            {values.map((val, idx) => (
              <input
                key={idx}
                ref={inputsRef[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-12 text-center text-lg rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify
          </button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleResend}
              className="text-teal-600 hover:text-teal-700"
              disabled={isSending}
            >
              {isSending ? 'Sending…' : 'Resend code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


