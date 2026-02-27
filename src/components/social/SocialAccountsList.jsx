import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Facebook, Linkedin, MapPin, Instagram, Hash, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const platformIcons = {
  facebook: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-100' },
  linkedin: { icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-100' },
  google_business: { icon: MapPin, color: 'text-red-600', bg: 'bg-red-100' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100' },
  threads: { icon: Hash, color: 'text-gray-900', bg: 'bg-gray-100' },
};

const platformNames = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  google_business: 'Google Business Profile',
  instagram: 'Instagram',
  threads: 'Threads',
};

export default function SocialAccountsList({ accounts }) {
  const queryClient = useQueryClient();

  const disconnectMutation = useMutation({
    mutationFn: (accountId) => base44.entities.SocialMediaAccount.delete(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const handleConnect = (platform) => {
    alert(`Connect to ${platformNames[platform]} - OAuth integration coming soon!`);
  };

  const connectedPlatforms = accounts.map((acc) => acc.platform);
  const availablePlatforms = Object.keys(platformNames).filter(
    (p) => !connectedPlatforms.includes(p)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Connected Accounts ({accounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No accounts connected yet</p>
          ) : (
            accounts.map((account) => {
              const { icon: Icon, color, bg } = platformIcons[account.platform];
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{platformNames[account.platform]}</p>
                      <p className="text-sm text-gray-600">{account.account_name}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate(account.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Disconnect
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {availablePlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add More Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlatforms.map((platform) => {
                const { icon: Icon, color, bg } = platformIcons[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => handleConnect(platform)}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className={`p-2 rounded-full ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <span className="font-medium">{platformNames[platform]}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}