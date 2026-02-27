import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, Search, Calendar, Clock, Tag, User } from 'lucide-react';

const samplePosts = [
  { id: '1', title: '10 Ways to Grow Your Business with AI', category: 'Marketing', status: 'published', author: 'Jane Smith', date: '2026-02-18', readTime: '5 min', views: 1240 },
  { id: '2', title: 'How to Build a Sales Funnel That Converts', category: 'Sales', status: 'published', author: 'John Doe', date: '2026-02-14', readTime: '8 min', views: 870 },
  { id: '3', title: 'The Future of Email Marketing in 2026', category: 'Email', status: 'draft', author: 'Jane Smith', date: '2026-02-20', readTime: '6 min', views: 0 },
  { id: '4', title: 'Building a Client Portal: Best Practices', category: 'Tech', status: 'scheduled', author: 'John Doe', date: '2026-02-25', readTime: '4 min', views: 0 },
];

const categories = ['All', 'Marketing', 'Sales', 'Email', 'Tech', 'Tips'];

export default function SitesBlog() {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editPost, setEditPost] = useState(null);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postCategory, setPostCategory] = useState('Marketing');

  const statusColors = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-700',
  };

  const filtered = samplePosts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  if (view === 'editor') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="text-gray-500">← Back to Blog</Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs"><Eye className="w-3.5 h-3.5" />Preview</Button>
            <Button size="sm" variant="outline" className="text-xs">Save Draft</Button>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1">Publish</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Input
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder="Article Title..."
              className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 text-gray-900 placeholder:text-gray-300"
            />
            <div className="flex items-center gap-3 text-sm text-gray-400 border-b pb-3">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Jane Smith</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Feb 22, 2026</span>
            </div>
            <div className="min-h-[400px] border border-gray-200 rounded-xl p-4">
              <div className="flex gap-2 mb-3 border-b pb-3 flex-wrap">
                {['B', 'I', 'U', 'H1', 'H2', '• List', '1. List', 'Link', 'Image', 'Quote'].map(tool => (
                  <button key={tool} className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 font-medium text-gray-600">{tool}</button>
                ))}
              </div>
              <textarea
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                placeholder="Start writing your article here..."
                className="w-full h-[340px] text-sm text-gray-700 resize-none focus:outline-none leading-relaxed"
              />
            </div>
          </div>
          <div className="space-y-4">
            <Card><CardContent className="p-4 space-y-3">
              <p className="font-semibold text-sm text-gray-700">Post Settings</p>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Category</Label>
                <Select value={postCategory} onValueChange={setPostCategory}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Tags</Label>
                <Input placeholder="Add tags..." className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Featured Image</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400 cursor-pointer hover:border-violet-300">
                  Click to upload image
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Publish Date</Label>
                <Input type="date" className="text-xs h-8" />
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-3">
              <p className="font-semibold text-sm text-gray-700">SEO</p>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Meta Title</Label>
                <Input placeholder="SEO title..." className="text-xs h-8" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Meta Description</Label>
                <textarea className="w-full border border-gray-200 rounded-lg text-xs px-3 py-2 h-16 resize-none focus:outline-none" placeholder="SEO description..." />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">URL Slug</Label>
                <Input placeholder="/blog/your-post-slug" className="text-xs h-8" />
              </div>
            </CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Blog & Articles</h2>
        <Button onClick={() => setView('editor')} className="bg-violet-600 hover:bg-violet-700 gap-2"><Plus className="w-4 h-4" />New Article</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterCategory === c ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{c}</button>
          ))}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 text-xs w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        {filtered.map(post => (
          <Card key={post.id} className="hover:shadow-md transition">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{post.title}</p>
                  <Badge className={`text-xs border-0 ${statusColors[post.status]}`}>{post.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.category}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} read</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views.toLocaleString()} views</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setView('editor')}><Edit className="w-3 h-3" />Edit</Button>
                <Button size="sm" variant="outline" className="gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}