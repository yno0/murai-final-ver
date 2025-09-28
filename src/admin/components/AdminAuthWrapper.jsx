import React from 'react';
import { AdminAuthProvider } from '../contexts/AdminAuthContext.jsx';

export default function AdminAuthWrapper({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
