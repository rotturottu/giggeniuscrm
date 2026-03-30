// src/api/base44Client.js
import { createClient } from '@base44/sdk';

// CRITICAL: Ensure this DOES NOT have :5000 so it goes through the Nginx proxy
const SERVER_URL = 'https://crm.gig-genius.io';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: SERVER_URL,
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,

  // Standard SDK headers
  headers: () => {
    const savedEmail = localStorage.getItem('userEmail');
    return {
      'User-Email': savedEmail || '',
      'Content-Type': 'application/json'
    };
  }
});

/**
 * AVAILABLE ENTITIES FOR MESSAGING:
 * base44.entities.Conversation -> For the chat thread lists
 * base44.entities.Message      -> For the individual chat bubbles
 * base44.entities.Employee     -> To fetch the "To:" dropdown list
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
      const response = await fetch(`${SERVER_URL}/api/apps/giggenius-crm/entities/User/me`, {
        method: 'GET',
        headers: {
          'User-Email': savedEmail,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('gigGeniusAuth');
          localStorage.removeItem('userEmail');
          window.location.href = '/login';
        }
        const errorData = await response.json();
        console.error("Backend error:", errorData.error);
        return null;
      }

      const data = await response.json();
      return data;

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