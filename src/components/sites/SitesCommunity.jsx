import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Heart, MessageSquare, Plus, Search, Pin, ThumbsUp, Bell, Settings, Users, Hash, Lock, Globe, Award } from 'lucide-react';

const sampleChannels = [
  { id: '1', name: 'general', type: 'public', members: 142, posts: 832 },
  { id: '2', name: 'introductions', type: 'public', members: 142, posts: 145 },
  { id: '3', name: 'wins-and-celebration', type: 'public', members: 98, posts: 301 },
  { id: '4', name: 'vip-mastermind', type: 'private', members: 23, posts: 220 },
];

const samplePosts = [
  {
    id: '1', author: 'Alice Johnson', avatar: 'AJ', time: '2 hours ago', pinned: true,
    content: '🎉 Just closed a $10k deal using the sales funnel strategy from Module 3! Highly recommend everyone check it out.',
    likes: 24, comments: 8, channel: 'wins-and-celebration'
  },
  {
    id: '2', author: 'Mark Rivera', avatar: 'MR', time: '5 hours ago', pinned: false,
    content: 'Quick question: which email sequence works best for cold outbound? I\'ve tried the welcome sequence but getting low open rates. Any tips?',
    likes: 6, comments: 14, channel: 'general'
  },
  {
    id: '3', author: 'Sarah Chen', avatar: 'SC', time: 'Yesterday', pinned: false,
    content: 'Hi everyone! I\'m Sarah, a marketing consultant from Sydney. Really excited to be part of this community and learn from you all! 👋',
    likes: 18, comments: 5, channel: 'introductions'
  },
];

const leaderboard = [
  { name: 'Alice Johnson', points: 2840, badge: '🥇', posts: 145 },
  { name: 'Mark Rivera', points: 2120, badge: '🥈', posts: 98 },
  { name: 'Sarah Chen', points: 1870, badge: '🥉', posts: 76 },
  { name: 'Tom Nguyen', points: 1540, badge: '⭐', posts: 62 },
  { name: 'Lisa Park', points: 1290, badge: '⭐', posts: 48 },
];

export default function SitesCommunity() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [postContent, setPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('feed');

  const filteredPosts = samplePosts.filter(p =>
    activeChannel === 'all' || p.channel === activeChannel
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Community</h2>
          <p className="text-sm text-gray-500">Your branded member community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-sm"><Settings className="w-4 h-4" />Settings</Button>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2 text-sm"><Globe className="w-4 h-4" />View Public Page</Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="feed">💬 Feed</TabsTrigger>
          <TabsTrigger value="channels"><Hash className="w-3.5 h-3.5 mr-1" />Channels</TabsTrigger>
          <TabsTrigger value="members"><Users className="w-3.5 h-3.5 mr-1" />Members</TabsTrigger>
          <TabsTrigger value="leaderboard"><Award className="w-3.5 h-3.5 mr-1" />Leaderboard</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4">
          <div className="grid grid-cols-4 gap-6">
            {/* Channels Sidebar */}
            <div className="col-span-1 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Channels</p>
              <button
                onClick={() => setActiveChannel('all')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${activeChannel === 'all' ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Globe className="w-4 h-4" />All Channels
              </button>
              {sampleChannels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${activeChannel === ch.name ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {ch.type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  <span className="truncate">{ch.name}</span>
                  <span className="ml-auto text-xs opacity-60">{ch.members}</span>
                </button>
              ))}
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-violet-600">
                <Plus className="w-3.5 h-3.5" />Add Channel
              </button>
            </div>

            {/* Feed */}
            <div className="col-span-3 space-y-4">
              {/* Compose */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">Y</div>
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Share something with the community..."
                      className="w-full text-sm text-gray-700 resize-none focus:outline-none min-h-[80px]"
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button className="text-xs text-gray-400 hover:text-violet-600 flex items-center gap-1"><span>📷</span>Photo</button>
                        <button className="text-xs text-gray-400 hover:text-violet-600 flex items-center gap-1"><span>🎬</span>Video</button>
                        <button className="text-xs text-gray-400 hover:text-violet-600 flex items-center gap-1"><span>📊</span>Poll</button>
                      </div>
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs h-7">Post</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {filteredPosts.map(post => (
                <Card key={post.id} className="hover:shadow-md transition">
                  <CardContent className="p-5">
                    {post.pinned && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit mb-3">
                        <Pin className="w-3 h-3" />Pinned
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900">{post.author}</p>
                          <span className="text-xs text-gray-400">in</span>
                          <Badge variant="outline" className="text-xs py-0"><Hash className="w-2.5 h-2.5 mr-0.5" />{post.channel}</Badge>
                          <span className="text-xs text-gray-400">· {post.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <button className="flex items-center gap-1 hover:text-violet-600 transition"><ThumbsUp className="w-3.5 h-3.5" />{post.likes}</button>
                          <button className="flex items-center gap-1 hover:text-violet-600 transition"><MessageSquare className="w-3.5 h-3.5" />{post.comments} comments</button>
                          <button className="flex items-center gap-1 hover:text-violet-600 transition">Share</button>
                          <button className="flex items-center gap-1 hover:text-amber-500 transition"><Pin className="w-3.5 h-3.5" />Pin</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Manage Channels</h3>
            <Button className="bg-violet-600 hover:bg-violet-700 text-sm gap-2"><Plus className="w-4 h-4" />New Channel</Button>
          </div>
          <div className="grid gap-3">
            {sampleChannels.map(ch => (
              <Card key={ch.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
                      {ch.type === 'private' ? <Lock className="w-4 h-4 text-violet-600" /> : <Hash className="w-4 h-4 text-violet-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{ch.name}</p>
                      <p className="text-xs text-gray-400">{ch.members} members · {ch.posts} posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ch.type === 'private' ? 'bg-amber-100 text-amber-700 border-0' : 'bg-green-100 text-green-700 border-0'}>{ch.type}</Badge>
                    <Button size="sm" variant="outline" className="text-xs"><Settings className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700 text-sm gap-2"><Plus className="w-4 h-4" />Invite Member</Button>
          </div>
          <Card><CardContent className="p-0">
            {[
              { name: 'Alice Johnson', email: 'alice@example.com', role: 'moderator', joined: 'Jan 2026', posts: 145 },
              { name: 'Mark Rivera', email: 'mark@example.com', role: 'member', joined: 'Feb 2026', posts: 98 },
              { name: 'Sarah Chen', email: 'sarah@example.com', role: 'member', joined: 'Feb 2026', posts: 76 },
              { name: 'Tom Nguyen', email: 'tom@example.com', role: 'member', joined: 'Dec 2025', posts: 62 },
            ].map((member, i) => (
              <div key={i} className={`flex items-center justify-between px-5 py-4 ${i < 3 ? 'border-b' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{member.name[0]}</div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-400">{member.posts} posts</p>
                  <p className="text-xs text-gray-400">Joined {member.joined}</p>
                  <Badge className={member.role === 'moderator' ? 'bg-violet-100 text-violet-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>{member.role}</Badge>
                  <Button size="sm" variant="outline" className="text-xs">Manage</Button>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">🏆 Community Leaderboard</h3>
              <p className="text-sm text-gray-500">Members ranked by community participation and engagement</p>
            </div>
            {leaderboard.map((member, i) => (
              <Card key={i} className={i === 0 ? 'border-2 border-amber-400 shadow-md' : ''}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="text-2xl w-10 text-center">{member.badge}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.posts} posts this month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-600 text-lg">{member.points.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card><CardContent className="p-5 space-y-4">
              <p className="font-semibold text-gray-800">Community Settings</p>
              <div><Label className="text-xs text-gray-500 mb-1 block">Community Name</Label><Input defaultValue="GigGenius Community" className="text-sm" /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Description</Label><textarea className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 h-20 resize-none focus:outline-none" defaultValue="A place for our members to connect, share wins, and grow together." /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Community URL Slug</Label><Input defaultValue="/community" className="text-sm" /></div>
              <div><Label className="text-xs text-gray-500 mb-1 block">Banner Image</Label><div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 cursor-pointer hover:border-violet-300">Upload Banner</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-5 space-y-4">
              <p className="font-semibold text-gray-800">Access & Moderation</p>
              {[
                { label: 'Public community', sub: 'Anyone can view posts', defaultOn: false },
                { label: 'Require approval to join', sub: 'Manually approve new members', defaultOn: true },
                { label: 'Gamification & points', sub: 'Award points for participation', defaultOn: true },
                { label: 'Leaderboard visible', sub: 'Show rankings to members', defaultOn: true },
                { label: 'Email digest', sub: 'Weekly community digest email', defaultOn: true },
                { label: 'Post moderation', sub: 'Review posts before publishing', defaultOn: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-500">{item.sub}</p></div>
                  <Switch defaultChecked={item.defaultOn} />
                </div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}