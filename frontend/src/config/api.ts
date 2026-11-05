/**
 * Centralized API Configuration for PathForge Frontend
 */

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }

  // Remove trailing slashes and whitespace
  const sanitized = envUrl.trim().replace(/\/+$/, '');

  // If already relative '/api' or already ends with '/api', return as is
  if (sanitized === '/api' || sanitized.endsWith('/api')) {
    return sanitized;
  }

  // When a backend host domain is provided (e.g. https://pathforge-vb2f.onrender.com),
  // automatically append '/api' because Express routes are mounted under '/api'
  return `${sanitized}/api`;
}

// 60-second timeout to accommodate cold starts on cloud providers like Render free tier
export const API_TIMEOUT_MS = 60000;

