import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import CreatePostDialog from '../components/social/CreatePostDialog';
import ScheduledPostsList from '../components/social/ScheduledPostsList';
import SocialAccountsList from '../components/social/SocialAccountsList';

export default function SocialMedia() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  // 1. Fetch User with Safety
  const { data: user, isError: userError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (e) {
        return { subscription_plan: 'free' }; // Fallback to avoid crash
      }
    },
    retry: false
  });

  // 2. Fetch Accounts with Safety
  const { data: remoteAccounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      try {
        const res = await base44.entities.SocialMediaAccount.filter({ is_active: true });
        return Array.isArray(res) ? res : [];
      } catch (e) { return []; }
    },
  });

  // 3. Fetch Posts with Safety
  const { data: remotePosts, isError: postsError } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: async () => {
      try {
        const res = await base44.entities.ScheduledPost.filter({ status: 'scheduled' }, '-scheduled_date');
        return Array.isArray(res) ? res : [];
      } catch (e) { return []; }
    },
  });

  // Safeguard the data lists
  const accounts = Array.isArray(remoteAccounts) ? remoteAccounts : [];
  const scheduledPosts = Array.isArray(remotePosts) ? remotePosts : [];

  const isPro = user?.subscription_plan === 'pro';
  const maxScheduleDays = isPro ? 365 : 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* API Warning Banner */}
        {(userError || postsError) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            Limited connectivity. Some social features may be offline.
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Social Media Manager
            </h1>
            <p className="text-gray-600 font-medium">
              Schedule posts up to {maxScheduleDays} days in advance
              {!isPro && (
                <span className="ml-2 text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                  (Upgrade to Pro for 365-day scheduling)
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePost(true)}
            disabled={accounts.length === 0}
            className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-lg transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>

        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-white/50 backdrop-blur">
            <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <Card className="border-dashed border-2 bg-white/30">
                <CardContent className="pt-10 pb-10 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium mb-4">No scheduled posts found</p>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    disabled={accounts.length === 0}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
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