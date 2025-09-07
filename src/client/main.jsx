import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from './pages/Landing.jsx'

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
])

export default function ClientApp() {
  return <RouterProvider router={router} />
}

