import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1f1f1f',
          color: '#ffffff',
          border: '1px solid #3f3f3f',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
        },
        success: {
          iconTheme: {
            primary: '#3ea6ff',
            secondary: '#1f1f1f',
          },
        },
      }} />
    </AuthProvider>
  </StrictMode>,
)
