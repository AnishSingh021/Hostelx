// Centralized configuration for HostelX Frontend
// Uses VITE_API_URL dynamic environment variable with a robust fallback to production URL

let backendUrl = import.meta.env.VITE_API_URL || 'https://hostelx-backend-a228.onrender.com';

// Fallback to production backend if deployed on HTTPS but loaded with a localhost env variable
if (window.location.protocol === 'https:' && backendUrl.startsWith('http://localhost')) {
  backendUrl = 'https://hostelx-backend-a228.onrender.com';
}

export const BACKEND_URL = backendUrl;
