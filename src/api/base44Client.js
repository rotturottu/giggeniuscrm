// src/api/base44Client.js
import { createClient } from '@base44/sdk';

const SERVER_URL = 'https://crm.gig-genius.io';

export const base44 = createClient({
  appId: 'giggenius-crm',
  // REMOVE /api FROM HERE. Nginx adds it automatically.
  serverUrl: SERVER_URL, 
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,

  headers: () => {
    const email = window.localStorage.getItem('userEmail');
    console.log("Outgoing Header Email:", email); 
    return {
      'User-Email': email || '',
      'Content-Type': 'application/json'
    };
  }
});

base44.auth = {
  ...base44.auth,

  me: async () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) return null;

    try {
      // CHANGE: Use relative path /api instead of full SERVER_URL
      // This ensures the browser sends crm.gig-genius.io/api/...
      const response = await fetch(`/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });
      // ... rest of your me logic
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  updateMe: async (data) => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) throw new Error("Auth required");

    // CHANGE: Use relative path /api here too
    const response = await fetch(`/api/apps/giggenius-crm/entities/User/me`, {
      method: 'PUT',
      headers: {
        'User-Email': savedEmail,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    // ... rest of your updateMe logic
    return await response.json();
  }
};