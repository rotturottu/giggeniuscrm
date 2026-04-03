import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: 'https://crm.gig-genius.io',
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,
  // This MUST be a function so it runs EVERY time you click a button
  headers: () => {
    const email = window.localStorage.getItem('userEmail');
    console.log("CRITICAL DEBUG - Sending Email:", email);
    return {
      'User-Email': email || '',
      'Content-Type': 'application/json'
    };
  }
});