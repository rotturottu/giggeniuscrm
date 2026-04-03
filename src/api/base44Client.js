import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: 'giggenius-crm',
  serverUrl: 'https://crm.gig-genius.io',
  token: '',
  functionsVersion: 'v1',
  requiresAuth: false,
  // We no longer rely on the SDK for headers.
});

// --- THE RAW NETWORK INTERCEPTOR ---
// This intercepts the browser's engine to force the email header 
// onto EVERY request, completely bypassing the SDK's caching issues.

// 1. Intercept XHR (Used by most SDKs, as seen in your console logs)
const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    originalXhrOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function(body) {
    // Only intercept calls going to your backend API
    if (this._url && this._url.includes('/api/apps/giggenius-crm')) {
        // Grab the email FRESH right at the exact millisecond the button is clicked
        const email = window.localStorage.getItem('userEmail');
        if (email) {
            this.setRequestHeader('User-Email', email);
        }
    }
    originalXhrSend.apply(this, arguments);
};

// 2. Intercept modern Fetch API (As a backup failsafe)
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.includes('/api/apps/giggenius-crm')) {
        const email = window.localStorage.getItem('userEmail');
        config = config || {};
        config.headers = {
            ...config.headers,
            'User-Email': email || ''
        };
        args = [resource, config];
    }
    return originalFetch.apply(this, args);
};