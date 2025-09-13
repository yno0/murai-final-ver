import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import SelectUser from './pages/SelectUser.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import TestGoogleAuth from './pages/TestGoogleAuth.jsx'
import ExtensionSuccess from './pages/ExtensionSuccess.jsx'
import ClientLayout from './layouts/ClientLayout.jsx'
import Overview from './pages/features/Overview.jsx'
import Analytics from './pages/features/Analytics.jsx'
import Report from './pages/features/Report.jsx'
import Help from './pages/features/Help.jsx'
import Settings from './pages/features/Settings.jsx'
import Group from './pages/features/Group.jsx'
import Extension from './pages/features/Extension.jsx'

function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-600">Page not found.</p>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      { path: 'dashboard', element: <Overview /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'reports', element: <Report /> },
      { path: 'group', element: <Group /> },
      { path: 'extension', element: <Extension /> },
      { path: 'help', element: <Help /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/extension-success',
    element: <ExtensionSuccess />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/register',
    element: <Signup />,
  }
  ,
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  }
  ,
  {
    path: '/select-user',
    element: <SelectUser />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/test-google-auth',
    element: <TestGoogleAuth />,
  },
])

export default function ClientApp() {
  return <RouterProvider router={router} />
}

