// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: 'http://72.61.114.146:5000', // MUST be http:// + IP
  token: '', 
  functionsVersion: 'v1',
  requiresAuth: false
});