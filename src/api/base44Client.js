// src/api/base44Client.js
import { createClient } from '@base44/sdk';

// CRITICAL: Ensure this DOES NOT have :5000 so it goes through the Nginx proxy
const SERVER_URL = 'http://crm.gig-genius.io';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: SERVER_URL,
  token: '', 
  functionsVersion: 'v1',
  requiresAuth: false,
  
  headers: () => {
    const savedEmail = localStorage.getItem('userEmail');
    return {
      'User-Email': savedEmail || '',
      'Content-Type': 'application/json'
    };
  }
});

/**
 * Custom Auth object to sync with your Flask + SQLite backend
 */
base44.auth = {
  ...base44.auth,
  
  me: async () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      console.warn("No userEmail found in localStorage.");
      return null;
    }

    try {
      // Fetching from Nginx (Port 80) which proxies to Flask (Port 5000)
      const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // THE CLEANUP CREW: If backend says unauthorized, wipe the ghost session
        if (response.status === 401) {
          localStorage.removeItem('gigGeniusAuth');
          localStorage.removeItem('userEmail');
          window.location.href = '/login'; 
        }

        const errorData = await response.json();
        console.error("Backend error:", errorData.error);
        return null;
      }
      
      // RESTORED: The code to actually return your profile data if successful!
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
      // data contains { firstName, lastName, email, profilePicture }
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }

    const result = await response.json();
    
    // If the email was changed, update localStorage so the next refresh still works
    if (data.email && data.email !== savedEmail) {
      localStorage.setItem('userEmail', data.email);
    }

    return result;
  }
};