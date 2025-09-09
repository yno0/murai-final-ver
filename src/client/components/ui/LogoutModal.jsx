import React from 'react';

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Log out?</h2>
        <p className="text-sm text-gray-600 mb-5">You will be returned to the login page.</p>
        <div className="flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;


