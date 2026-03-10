import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Lock, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function MyProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(''); 
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(''); // New state for password validation
  
  // State & ref for Avatar Upload
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  // Handle Image Selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Email Input & Validation
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    
    if (val && !val.includes('@')) {
      setEmailError('Invalid email!');
    } else {
      setEmailError('');
    }
  };

  const handleUpdateProfile = () => {
    if (!fullName || !email) {
      toast.error('Full name and email are required');
      return;
    }

    if (!email.includes('@')) {
      setEmailError('Invalid email!');
      toast.error('Please provide a valid email address.');
      return;
    }
    
    const payload = { 
      full_name: fullName, 
      email: email 
    };
    
    if (avatarFile) {
      payload.avatar = avatarFile; 
    }

    updateProfileMutation.mutate(payload);
  };

  const handleUpdatePassword = () => {
    // Check for empty fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Invalid password! All fields are required!');
      return;
    }
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Invalid password! New passwords do not match!');
      return;
    }
    // Check minimum length
    if (newPassword.length < 8) {
      setPasswordError('Invalid password! Password must be at least 8 characters!');
      return;
    }
    
    setPasswordError(''); // Clear errors if everything is good
    toast.success('Password change functionality coming soon');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm text-gray-600 mb-1">Profile Picture</p>
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

          <div className="grid gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                value={email}
                onChange={handleEmailChange}
                placeholder="john.doe@example.com"
                className={`mt-1 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {emailError && (
                <p className="text-sm text-red-500 font-medium mt-1">{emailError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Note: please make sure if you are a giggenius user, use the same email.
              </p>
            </div>

            <div>
              <Label>Role</Label>
              <Input
                value={user?.role || 'user'}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Security
          </CardTitle>
          <CardDescription>Update your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              Current Password
              <span className="text-xs font-normal text-gray-500 italic">
                (for users who signed up using SSO, you can't change password)
              </span>
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter current password"
              className={`mt-1 ${passwordError && !currentPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
          </div>

          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter new password"
              className={`mt-1 ${passwordError && (!newPassword || newPassword !== confirmPassword || newPassword.length < 8) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Confirm new password"
              className={`mt-1 ${passwordError && (!confirmPassword || newPassword !== confirmPassword) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
          </div>

          {/* Password Validation Error Warning */}
          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold animate-in fade-in duration-300">
              {passwordError}
            </div>
          )}

          <Button
            onClick={handleUpdatePassword}
            variant="outline"
          >
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}