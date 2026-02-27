import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Share2, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { base44 } from '@/api/base44Client';

const GOOGLE_CLIENT_ID = '224435778723-d3v63mh4nnvj1pbrfbg7bsa7om5g9o28.apps.googleusercontent.com';
const MICROSOFT_CLIENT_ID = '039a4bed-02aa-4bb4-b86c-60638a90ea44';
const REDIRECT_URI = window.location.origin + window.location.pathname;

const GOOGLE_SCOPES = {
  gmail: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/contacts.readonly',
  calendar: 'https://www.googleapis.com/auth/calendar',
};

const MICROSOFT_SCOPES = 'openid profile email offline_access https://outlook.office.com/Mail.ReadWrite https://outlook.office.com/Mail.Send https://outlook.office.com/Calendars.ReadWrite';

const META_APP_ID = '1313223320631691';
const THREADS_APP_ID = '1488248559331228';

const META_SCOPES = {
  facebook: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,instagram_basic,instagram_manage_comments,whatsapp_business_management,whatsapp_business_messaging',
  instagram: 'public_profile,email,instagram_basic,instagram_manage_comments,instagram_manage_insights,instagram_content_publish',
  whatsapp: 'public_profile,email,whatsapp_business_management,whatsapp_business_messaging',
  threads: 'threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies',
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState({
    gmail: false,
    outlook: false,
    calendar: false,
    googleBusiness: false,
    facebook: false,
    instagram: false,
    whatsapp: false,
    threads: false,
    linkedin: false,
  });

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && (state === 'gmail' || state === 'calendar')) {
      base44.auth.me().then(() => {
        const updates = {};
        updates[`google_${state}_connected`] = true;
        updates[`google_${state}_code`] = code;
        return base44.auth.updateMe(updates);
      }).then(() => {
        setIntegrations(prev => ({ ...prev, [state]: true }));
        toast.success(`${state === 'gmail' ? 'Gmail' : 'Google Calendar'} connected successfully!`);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    } else if (code && state === 'outlook') {
      base44.auth.updateMe({ microsoft_outlook_connected: true, microsoft_outlook_code: code }).then(() => {
        setIntegrations(prev => ({ ...prev, outlook: true }));
        toast.success('Outlook connected successfully!');
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    // Handle Meta OAuth callback (token in hash for implicit, or code for server-side)
    const metaServices = ['facebook', 'instagram', 'whatsapp', 'threads'];
    if (code && metaServices.includes(state)) {
      const updates = { [`meta_${state}_connected`]: true, [`meta_${state}_code`]: code };
      base44.auth.updateMe(updates).then(() => {
        setIntegrations(prev => ({ ...prev, [state]: true }));
        const names = { facebook: 'Facebook', instagram: 'Instagram', whatsapp: 'WhatsApp', threads: 'Threads' };
        toast.success(`${names[state]} connected successfully!`);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  // Load connection status from user profile
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user) {
        setIntegrations(prev => ({
          ...prev,
          gmail: !!user.google_gmail_connected,
          calendar: !!user.google_calendar_connected,
          outlook: !!user.microsoft_outlook_connected,
          facebook: !!user.meta_facebook_connected,
          instagram: !!user.meta_instagram_connected,
          whatsapp: !!user.meta_whatsapp_connected,
          threads: !!user.meta_threads_connected,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleGoogleConnect = (service) => {
    const scope = GOOGLE_SCOPES[service];
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope,
      state: service,
      access_type: 'offline',
      prompt: 'consent',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleMicrosoftConnect = () => {
    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: MICROSOFT_SCOPES,
      state: 'outlook',
      response_mode: 'query',
    });
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  };

  const handleMetaConnect = (service) => {
    const appId = service === 'threads' ? THREADS_APP_ID : META_APP_ID;
    const scope = META_SCOPES[service];
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope,
      state: service,
    });
    const baseUrl = service === 'threads'
      ? 'https://threads.net/oauth/authorize'
      : 'https://www.facebook.com/v19.0/dialog/oauth';
    window.location.href = `${baseUrl}?${params.toString()}`;
  };

  const handleConnect = (service) => {
    if (service === 'Gmail') {
      handleGoogleConnect('gmail');
    } else if (service === 'Google Calendar') {
      handleGoogleConnect('calendar');
    } else if (service === 'Outlook') {
      handleMicrosoftConnect();
    } else if (['Facebook', 'Instagram', 'WhatsApp', 'Threads'].includes(service)) {
      handleMetaConnect(service.toLowerCase());
    } else {
      toast.success(`${service} integration coming soon`);
    }
  };

  const handleDisconnect = (service) => {
    const keyMap = {
      gmail: 'google_gmail_connected',
      calendar: 'google_calendar_connected',
      outlook: 'microsoft_outlook_connected',
      facebook: 'meta_facebook_connected',
      instagram: 'meta_instagram_connected',
      whatsapp: 'meta_whatsapp_connected',
      threads: 'meta_threads_connected',
    };
    const key = keyMap[service] || `meta_${service}_connected`;
    base44.auth.updateMe({ [key]: false }).then(() => {
      setIntegrations(prev => ({ ...prev, [service]: false }));
      toast.success(`${service} disconnected`);
    });
  };

  const emailIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect your Gmail account to sync emails and contacts',
      icon: Mail,
      color: 'text-red-600',
      connected: integrations.gmail,
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Connect your Outlook account to sync emails and contacts',
      icon: Mail,
      color: 'text-blue-600',
      connected: integrations.outlook,
    },
  ];

  const calendarIntegrations = [
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync your calendar for meetings and reminders',
      icon: Calendar,
      color: 'text-green-600',
      connected: integrations.calendar,
    },
  ];

  const socialIntegrations = [
    {
      id: 'googleBusiness',
      name: 'Google Business Profile',
      description: 'Manage your Google Business Profile reviews and posts',
      icon: Building2,
      color: 'text-yellow-600',
      connected: integrations.googleBusiness,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Connect Facebook Pages for social media management and messaging',
      icon: Share2,
      color: 'text-blue-700',
      connected: integrations.facebook,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect Instagram Business account for posts and messages',
      icon: Share2,
      color: 'text-pink-600',
      connected: integrations.instagram,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Connect WhatsApp Business for customer messaging',
      icon: Share2,
      color: 'text-green-600',
      connected: integrations.whatsapp,
    },
    {
      id: 'threads',
      name: 'Threads',
      description: 'Connect Threads for social media management and posting',
      icon: Share2,
      color: 'text-gray-800',
      connected: integrations.threads,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Connect LinkedIn for professional networking',
      icon: Share2,
      color: 'text-blue-600',
      connected: integrations.linkedin,
    },
  ];

  const IntegrationCard = ({ integration }) => {
    const Icon = integration.icon;
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 bg-gray-50 rounded-lg ${integration.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{integration.name}</h3>
                  {integration.connected && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            </div>
            {integration.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect(integration.id)}
                className="text-red-600 hover:text-red-700"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleConnect(integration.name)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Integrations
          </CardTitle>
          <CardDescription>
            Connect your email accounts to centralize all communications in the Conversations tab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Calendar Integration
          </CardTitle>
          <CardDescription>Sync your calendar for scheduling and reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {calendarIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Social Media & Business Profiles
          </CardTitle>
          <CardDescription>
            Connect your social media and business profiles to manage all messages in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}