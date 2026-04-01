// src/api/base44Client.js
import { createClient } from '@base44/sdk';

// Ensure this matches your Nginx proxy URL
const SERVER_URL = 'https://crm.gig-genius.io';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: SERVER_URL,
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,

  // This ensures EVERY background SDK request sends your identity
  headers: () => {
    const savedEmail = localStorage.getItem('userEmail');
    return {
      'User-Email': savedEmail || '',
      'Content-Type': 'application/json'
    };
  }
});

base44.auth = {
  ...base44.auth,

  me: async () => {
    const savedEmail = localStorage.getItem('userEmail');
    
    // 1. If no local email, you aren't logged in
    if (!savedEmail || savedEmail === 'null') {
      console.warn("No userEmail found in localStorage.");
      return null;
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });

      // 2. Handle errors
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          console.error("Identity invalid. Resetting session...");
          localStorage.removeItem('gigGeniusAuth');
          localStorage.removeItem('userEmail');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
        return null;
      }

      const data = await response.json();
      
      // Handle the fail-safe "authenticated: false" from backend
      if (data && data.authenticated === false) {
          return null;
      }

      return data;

    } catch (error) {
      console.error("Auth Me API Connection Error:", error);
      return null;
    }
  },

  updateMe: async (data) => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) throw new Error("Authentication required to update profile.");

    const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
      method: 'PUT',
      headers: {
        'User-Email': savedEmail,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }

    const result = await response.json();

    if (data.email && data.email !== savedEmail) {
      localStorage.setItem('userEmail', data.email);
    }

    return result;
  }
};