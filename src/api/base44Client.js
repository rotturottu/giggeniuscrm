import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: 'https://crm.gig-genius.io',
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,
  headers: () => {
    const email = localStorage.getItem('userEmail');
    return {
      'User-Email': email || '',
      'Content-Type': 'application/json'
    };
  }
});

// ADD THIS: This forces the email into the BODY of every "create" call
const originalCreate = base44.entities.create;
base44.entities.create = async (entityName, data) => {
  const email = localStorage.getItem('userEmail');
  const enrichedData = { ...data, user_email: email };
  return originalCreate(entityName, enrichedData);
};