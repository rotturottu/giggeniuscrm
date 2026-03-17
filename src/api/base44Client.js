// src/api/base44Client.js
import { createClient } from '@base44/sdk';

const SERVER_URL = 'http://72.61.114.146';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: SERVER_URL,
  token: '', 
  functionsVersion: 'v1',
  requiresAuth: false,
  
  // This helps generic SDK calls know who is logged in
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
      const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) console.warn("No active session found.");
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("Auth Me API Error:", error);
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

    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  }
};