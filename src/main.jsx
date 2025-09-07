import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./shared/styles/index.css";
import ClientApp from './client/main.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClientApp />
  </StrictMode>,
)
