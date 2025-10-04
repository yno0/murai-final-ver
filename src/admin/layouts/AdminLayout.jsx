import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminProtectedRoute from '../components/AdminProtectedRoute.jsx';
import { AdminToastProvider } from '../contexts/ToastContext.jsx';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  return (
    <AdminProtectedRoute>
      <AdminToastProvider>
        <div className="min-h-screen w-full bg-white text-gray-900">
          <AdminSidebar />
          <main
            className={`min-h-screen overflow-auto transition-all duration-300 ${
              sidebarOpen ? 'ml-80' : 'ml-16'
            }`}
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </AdminToastProvider>
    </AdminProtectedRoute>
  );
}
