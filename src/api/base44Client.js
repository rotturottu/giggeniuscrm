import { createClient } from '@base44/sdk';

// This URL is now secure and goes through the Nginx proxy
const SERVER_URL = 'https://crm.gig-genius.io';

export const base44 = createClient({
  appId: 'giggenius-crm',
  // Adding /api here matches the "location /api" block we just added to Nginx
  serverUrl: `${SERVER_URL}/api`, 
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,

  // This ensures standard SDK calls (like fetching contacts/tasks) 
  // always include Gabrielle's email in the headers for Nginx to see
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
      // Using the secure domain URL
      const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });

      // 2. Handle 401 (Unauthorized) or 404 (User doesn't exist in new DB)
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('gigGeniusAuth');
          localStorage.removeItem('userEmail');
          
          // Redirect to login so the user can re-register or re-login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        const errorData = await response.json();
        console.error("Backend error:", errorData.error);
        return null;
      }

      const data = await response.json();
      return data;

    } catch (error) {
      // RESTORED: The catch block to prevent the app from crashing on network errors
      console.error("Auth Me API Error (Network or CORS):", error);
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