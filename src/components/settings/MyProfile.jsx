import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Lock, Save, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function MyProfile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  // Fetch user data from backend
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Load data into state when user is fetched
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      if (user.profilePicture) {
        setAvatarPreview(user.profilePicture);
      }
    }
  }, [user]);

  // Real-time Email Availability Check
  useEffect(() => {
    const checkEmailDatabase = async () => {
      // Don't check if it's their own email
      if (!email || email === user?.email) {
        setIsEmailAvailable(true);
        setEmailError('');
        return;
      }

      if (!email.includes('@')) {
        setEmailError('Invalid email format');
        return;
      }

      try {
        const response = await axios.post('http://crm.gig-genius.io:5000/api/auth/check-email', { 
          email: email,
          exclude_current: user?.email 
        });
        
        if (!response.data.available) {
          setIsEmailAvailable(false);
          setEmailError('This email is already taken by another account.');
        } else {
          setIsEmailAvailable(true);
          setEmailError('');
        }
      } catch (err) {
        console.error("Check email failed", err);
      }
    };

    const timeoutId = setTimeout(checkEmailDatabase, 500); 
    return () => clearTimeout(timeoutId);
  }, [email, user?.email]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      // CRITICAL: Refetch both keys to update MyProfile AND the Layout/Navbar
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Update failed: ' + (error.response?.data?.error || error.message));
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (!firstName || !lastName || !email) {
      toast.error('All fields are required');
      return;
    }

    if (!isEmailAvailable) {
      toast.error('Please use a different email address.');
      return;
    }

    const payload = { 
      firstName: firstName,
      lastName: lastName,
      email: email,
      profilePicture: avatarPreview 
    };

    updateProfileMutation.mutate(payload);
  };

  const getInitials = () => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and how others see you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-gray-100 shadow-sm overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Profile Picture</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                Change Avatar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${emailError ? 'border-red-500 ring-red-100' : ''}`}
                  placeholder="email@example.com"
                />
                {!isEmailAvailable && (
                  <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
                )}
              </div>
              {emailError && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  {emailError}
                </p>
              )}
              <p className="text-xs text-gray-400 italic">
                Note: Email must be unique to your account.
              </p>
            </div>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending || !isEmailAvailable}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Security
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
             <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
            </div>
          </div>
          <Button variant="outline" className="mt-2">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}