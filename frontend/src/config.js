// Centralized configuration for HostelX Frontend
// Uses VITE_API_URL dynamic environment variable with a robust fallback to production URL

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://hostelx-backend-a228.onrender.com';
