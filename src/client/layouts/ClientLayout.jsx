import React from 'react';
import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '../components/ClientSidebar';

export default function ClientLayout() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex">
      <ClientSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


