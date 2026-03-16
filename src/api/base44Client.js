// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: 'http://72.61.114.146:5000', // Your VPS IP
  token: '', 
  functionsVersion: 'v1',
  requiresAuth: false,
  
  // Custom headers to pass the logged-in user's email to the backend
  headers: () => {
    const savedEmail = localStorage.getItem('userEmail');
    return {
      'User-Email': savedEmail || '',
      'Content-Type': 'application/json'
    };
  }
});

/**
 * Helper to ensure the Auth object works with your custom SQLite backend
 */
base44.auth = {
  ...base44.auth,
  me: async () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) return null;

    try {
      const response = await fetch(
        `http://72.61.114.146:5000/api/apps/giggenius-crm/entities/User/me`,
        {
          method: 'GET',
          headers: {
            'User-Email': savedEmail,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error("Auth Me Error:", error);
      return null;
    }
  },

  // Added updateMe to support the Account Settings "Save Changes" button
  updateMe: async (data) => {
    const savedEmail = localStorage.getItem('userEmail');
    const response = await fetch(
      `http://72.61.114.146:5000/api/apps/giggenius-crm/entities/User/me`,
      {
        method: 'PUT',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    return await response.json();
  }
};