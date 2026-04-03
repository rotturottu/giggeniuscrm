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

/** * BODY INJECTION INTERCEPTOR
 * This overrides the default create and update methods to ensure
 * the email is ALWAYS inside the data packet.
 */

const originalCreate = base44.entities.create;
base44.entities.create = async (entityName, data) => {
  const email = localStorage.getItem('userEmail');
  // Inject email into the JSON body
  const enrichedData = { ...data, user_email: email };
  return originalCreate(entityName, enrichedData);
};

const originalUpdate = base44.entities.update;
base44.entities.update = async (entityName, entityId, data) => {
  const email = localStorage.getItem('userEmail');
  // Inject email into the JSON body
  const enrichedData = { ...data, user_email: email };
  return originalUpdate(entityName, entityId, enrichedData);
};