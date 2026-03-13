import { createClient } from '@base44/sdk';

// Manually override for the VPS
export const base44 = createClient({
  appId: 'giggenius-crm', // Use your actual App ID
  serverUrl: 'http://72.61.114.146:5000', 
  token: '', 
  functionsVersion: 'v1',
  requiresAuth: false
});