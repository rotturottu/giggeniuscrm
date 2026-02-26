import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus } from 'lucide-react';
import { useState } from 'react';
import CreatePostDialog from '../components/social/CreatePostDialog';
import ScheduledPostsList from '../components/social/ScheduledPostsList';
import SocialAccountsList from '../components/social/SocialAccountsList';

export default function SocialMedia() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => base44.entities.SocialMediaAccount.filter({ is_active: true }),
  });

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: () => base44.entities.ScheduledPost.filter({ status: 'scheduled' }, '-scheduled_date'),
  });

  const isPro = user?.subscription_plan === 'pro';
  const maxScheduleDays = isPro ? 365 : 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Social Media Manager
            </h1>
            <p className="text-gray-600">
              Schedule posts up to {maxScheduleDays} days in advance
              {!isPro && (
                <span className="ml-2 text-sm text-blue-600 font-semibold">
                  (Upgrade to Pro for 365-day scheduling)
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePost(true)}
            disabled={accounts.length === 0}
            className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>

        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No scheduled posts yet</p>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    disabled={accounts.length === 0}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScheduledPostsList posts={scheduledPosts} />
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <SocialAccountsList accounts={accounts} />
          </TabsContent>
        </Tabs>

        {showCreatePost && (
          <CreatePostDialog
            open={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            accounts={accounts}
            maxScheduleDays={maxScheduleDays}
          />
        )}
      </div>
    </div>
  );
}