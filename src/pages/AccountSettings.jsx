import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, CreditCard, Puzzle } from 'lucide-react';

export default function AccountSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({ name: '', email: '' });

  // 1. Fetch current user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => base44.auth.me(),
  });

  // 2. Sync local state when data arrives
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  // 3. Mutation to save profile changes
  const updateProfile = useMutation({
    mutationFn: (newData) => base44.auth.updateMe(newData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] });
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading your profile...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your profile, integrations, team, and billing</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> My Profile</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2"><Puzzle className="w-4 h-4" /> Integrations</TabsTrigger>
          <TabsTrigger value="access" className="gap-2"><Shield className="w-4 h-4" /> User Access</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="w-4 h-4" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500">Update your personal details and how others see you.</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Profile Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {getInitials(formData.name)}
                </div>
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Button variant="outline" size="sm" className="block">Change Avatar</Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input 
                    id="fullname" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={formData.email} 
                    disabled 
                    className="bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 italic font-medium">Email is managed by your organization.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button 
                  onClick={() => updateProfile.mutate({ name: formData.name })}
                  disabled={updateProfile.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Other Tabs would go here */}
      </Tabs>
    </div>
  );
}