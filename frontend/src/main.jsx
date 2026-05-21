import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { BACKEND_URL } from './config';

// Global fetch interceptor to dynamically swap the hardcoded backend URL with BACKEND_URL (VITE_API_URL or default production)
const originalFetch = window.fetch;
window.fetch = function (resource, options) {
  let url = resource;
  if (typeof resource === 'string' && resource.includes('https://hostelx-backend-a228.onrender.com')) {
    url = resource.replace('https://hostelx-backend-a228.onrender.com', BACKEND_URL);
  }
  return originalFetch(url, options);
};

// Force light theme globally
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
