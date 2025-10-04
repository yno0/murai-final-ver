import React, { createContext, useContext } from 'react';
import { useToast } from '../../client/components/ui/Toast.jsx';

const AdminToastContext = createContext();

export function AdminToastProvider({ children }) {
  const toast = useToast();

  return (
    <AdminToastContext.Provider value={toast}>
      {children}
      <toast.ToastContainer />
    </AdminToastContext.Provider>
  );
}

export function useAdminToastContext() {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToastContext must be used within an AdminToastProvider');
  }
  return context;
}

export default AdminToastContext;
