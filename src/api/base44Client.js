import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  // Ensure this is the correct production URL
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

/** * BODY INJECTION INTERCEPTORS
 * These override the default methods to ensure the email is 
 * ALWAYS inside the data packet, even if the header fails.
 */

const originalCreate = base44.entities.create;
base44.entities.create = async (entityName, data) => {
  const email = localStorage.getItem('userEmail');
  // Inject email into the JSON body for POST requests
  const enrichedData = { ...data, user_email: email };
  return originalCreate(entityName, enrichedData);
};

const originalUpdate = base44.entities.update;
base44.entities.update = async (entityName, entityId, data) => {
  const email = localStorage.getItem('userEmail');
  // Inject email into the JSON body for PUT requests
  const enrichedData = { ...data, user_email: email };
  return originalUpdate(entityName, entityId, enrichedData);
};