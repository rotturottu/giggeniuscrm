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
    if (!savedEmail) {
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

      // 2. Handle 401 (Unauthorized) or 404 (User doesn't exist in new DB)
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          console.error("Identity invalid or user not found in database. Resetting session...");
          
          // CRITICAL: Wipe local storage to stop the 401/404 loop
          localStorage.removeItem('gigGeniusAuth');
          localStorage.removeItem('userEmail');
          
          // Redirect to login so the user can re-register or re-login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return null;
      }

      const data = await response.json();
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

    // If you changed your email, update the local storage key
    if (data.email && data.email !== savedEmail) {
      localStorage.setItem('userEmail', data.email);
    }

    return result;
  }
};