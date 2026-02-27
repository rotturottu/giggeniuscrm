import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Users, Settings, Eye, Globe, ShieldCheck, FileText, CreditCard, MessageSquare, BarChart2 } from 'lucide-react';

const portalPages = [
  { id: '1', name: 'Dashboard', icon: '🏠', enabled: true, visible: true },
  { id: '2', name: 'My Invoices', icon: '🧾', enabled: true, visible: true },
  { id: '3', name: 'My Projects', icon: '📁', enabled: true, visible: true },
  { id: '4', name: 'Documents', icon: '📄', enabled: false, visible: false },
  { id: '5', name: 'Support Tickets', icon: '🎫', enabled: true, visible: true },
  { id: '6', name: 'My Courses', icon: '🎓', enabled: false, visible: false },
];

const clients = [
  { name: 'Acme Corp', email: 'admin@acme.com', status: 'active', lastLogin: '2 hours ago' },
  { name: 'Beta Ltd', email: 'john@betaltd.com', status: 'active', lastLogin: 'Yesterday' },
  { name: 'Gamma Inc', email: 'info@gamma.com', status: 'pending', lastLogin: 'Never' },
];

export default function SitesPortal() {
  const [pages, setPages] = useState(portalPages);
  const [portalUrl, setPortalUrl] = useState('portal.yoursite.com');
  const [allowSelfSignup, setAllowSelfSignup] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);

  const togglePage = (id, key) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, [key]: !p[key] } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Client Login Portal</h2>
          <p className="text-sm text-gray-500">Give clients a branded self-service portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-sm"><Eye className="w-4 h-4" />Preview Portal</Button>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2 text-sm"><Globe className="w-4 h-4" />Go Live</Button>
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1" />Settings</TabsTrigger>
          <TabsTrigger value="pages"><FileText className="w-3.5 h-3.5 mr-1" />Portal Pages</TabsTrigger>
          <TabsTrigger value="clients"><Users className="w-3.5 h-3.5 mr-1" />Clients</TabsTrigger>
          <TabsTrigger value="branding">🎨 Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Access & Security</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Portal URL</Label>
                  <div className="flex gap-2">
                    <Input value={portalUrl} onChange={e => setPortalUrl(e.target.value)} className="flex-1" />
                    <Button variant="outline" size="sm">Set Custom Domain</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <p className="text-sm font-medium">Allow Self Signup</p>
                    <p className="text-xs text-gray-500">Clients can create their own accounts</p>
                  </div>
                  <Switch checked={allowSelfSignup} onCheckedChange={setAllowSelfSignup} />
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <p className="text-sm font-medium">Require Approval</p>
                    <p className="text-xs text-gray-500">Manually approve each client signup</p>
                  </div>
                  <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                </div>
                <div className="flex items-center justify-between py-2 border-t">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-gray-500">Require 2FA for all clients</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: 'New client signup email', sub: 'Get notified when someone joins' },
                  { label: 'Login alert', sub: 'Alert when a client logs in' },
                  { label: 'Invoice viewed', sub: 'When client views an invoice' },
                  { label: 'Document downloaded', sub: 'When client downloads a file' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                    <Switch defaultChecked={i < 2} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {pages.map((page, i) => (
                <div key={page.id} className={`flex items-center justify-between px-5 py-4 ${i < pages.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{page.icon}</span>
                    <p className="font-medium text-gray-800">{page.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <Switch checked={page.enabled} onCheckedChange={() => togglePage(page.id, 'enabled')} />
                      <span>Enabled</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <Switch checked={page.visible} onCheckedChange={() => togglePage(page.id, 'visible')} />
                      <span>Visible in Menu</span>
                    </label>
                    <Button size="sm" variant="outline" className="text-xs gap-1"><Settings className="w-3 h-3" />Configure</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <Input placeholder="Search clients..." className="max-w-xs h-9" />
            <Button className="bg-violet-600 hover:bg-violet-700 text-sm gap-2">+ Invite Client</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {clients.map((client, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-4 ${i < clients.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                      {client.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-400">Last login: {client.lastLogin}</p>
                    <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>{client.status}</Badge>
                    <Button size="sm" variant="outline" className="text-xs">Manage</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <p className="font-semibold text-gray-800">Portal Branding</p>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Portal Name</Label>
                  <Input defaultValue="Client Portal" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Logo</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 cursor-pointer hover:border-violet-300">Upload Logo</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Primary Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#0891b2'].map(c => (
                      <button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Welcome Message</Label>
                  <textarea className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 h-20 resize-none" defaultValue="Welcome back! Manage your projects, invoices and more." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-2">
                <p className="font-semibold text-gray-800 mb-3">Portal Preview</p>
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-violet-600 px-4 py-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/30" />
                    <span className="text-white text-sm font-semibold">Client Portal</span>
                  </div>
                  <div className="bg-gray-50 p-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Dashboard</p>
                    {['My Invoices', 'My Projects', 'Support Tickets'].map(item => (
                      <div key={item} className="bg-white rounded-lg px-3 py-2 text-xs text-gray-700 flex items-center gap-2">
                        <div className="w-4 h-4 bg-violet-100 rounded" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}