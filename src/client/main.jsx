import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

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
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/login',
    element: <Login />,
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
])

export default function ClientApp() {
  return <RouterProvider router={router} />
}

