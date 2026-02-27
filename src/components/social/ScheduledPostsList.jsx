import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, X, Facebook, Linkedin, MapPin, Instagram, Hash } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const platformIcons = {
  facebook: { icon: Facebook, color: 'text-blue-600' },
  linkedin: { icon: Linkedin, color: 'text-blue-700' },
  google_business: { icon: MapPin, color: 'text-red-600' },
  instagram: { icon: Instagram, color: 'text-pink-600' },
  threads: { icon: Hash, color: 'text-gray-900' },
};

export default function ScheduledPostsList({ posts }) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (postId) =>
      base44.entities.ScheduledPost.update(postId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
    },
  });

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {format(new Date(post.scheduled_date), 'PPP p')}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    Scheduled
                  </Badge>
                </div>
                <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                  {post.platforms.map((platform) => {
                    const { icon: Icon, color } = platformIcons[platform];
                    return (
                      <div
                        key={platform}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100"
                      >
                        <Icon className={`w-3 h-3 ${color}`} />
                        <span className="text-xs text-gray-700 capitalize">
                          {platform.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelMutation.mutate(post.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}