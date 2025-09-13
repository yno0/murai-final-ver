import React, { useState } from 'react'
import Logo from "../../shared/assets/LogoMain.svg";

export default function SelectUser() {
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    { id: 'me', name: 'Me', email: 'you@example.com' },
    { id: 'family1', name: 'Family Member', email: 'family@example.com' },
    { id: 'team1', name: 'Team Member', email: 'teammate@example.com' },
  ];

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    // Navigate to signup with context
    window.location.href = `/signup?user=${encodeURIComponent(selectedUser)}`;
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden font-['Inter']">
      <div className="w-full lg:w-full bg-white px-5 sm:px-8 md:px-12 xl:px-16 py-6 sm:py-8 flex flex-col">
        <div className="pt-4 sm:pt-6 flex justify-center">
          <img src={Logo} alt="Logo" className="w-30 h-12 object-contain" />
        </div>

        <div className="flex-grow flex items-start sm:items-center justify-center px-3 sm:px-4">
          <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl  border-gray-100 mb-6 sm:mb-8">
            <div className="space-y-2 mb-6 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-[40px] font-semibold font-['Playfair_Display']">Select user</h1>
              <p className="text-gray-600 text-sm">Choose who you’re setting this up for</p>
            </div>

            <form onSubmit={handleContinue} className="space-y-4">
              <div className="space-y-2">
                {users.map((u) => (
                  <label key={u.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${selectedUser === u.id ? 'border-black/20 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="selectedUser"
                      value={u.id}
                      checked={selectedUser === u.id}
                      onChange={() => setSelectedUser(u.id)}
                      className="h-4 w-4 text-black focus:ring-black"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={!selectedUser}
                className={`w-full py-3 rounded-lg bg-teal-600 text-white font-medium transition ${!selectedUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'}`}
              >
                Continue
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <a href="/signup" className="text-sm text-gray-600 hover:text-gray-800 underline">Skip and continue</a>
            </div>
          </div>
        </div>
        <div className="py-6 sm:py-8">
          <p className="text-xs text-gray-500 text-center px-4">
            Need help deciding? <a href="/client/help" className="underline hover:text-gray-700">Visit Help & Support</a>.
          </p>
        </div>
      </div>
    </div>
  )
}




