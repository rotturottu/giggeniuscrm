import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  BarChart3, Users, MessageSquare, FolderKanban, Mail, 
  Share2, Globe, UserCog, Target, HeadphonesIcon, Settings, LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Overview', path: 'Overview', icon: BarChart3 },
  { name: 'Contacts', path: 'Contacts', icon: Users },
  { name: 'Conversations', path: 'Conversations', icon: MessageSquare }, 
  { name: 'Tasks', path: 'Tasks', icon: FolderKanban },             
  { name: 'Campaigns', path: 'Campaigns', icon: Mail },
  { name: 'Social Media', path: 'SocialMedia', icon: Share2 },
  { name: 'Sites', path: 'Sites', icon: Globe },
  { name: 'HR', path: 'HR', icon: UserCog },
  { name: 'Sales', path: 'Sales', icon: Target },
  { name: 'Support', path: 'ContactUs', icon: HeadphonesIcon },
];

export default function Layout({ children }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // 1. Fetch the actual logged-in user from your Flask backend
  const { data: user, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      console.log("Layout - Fetched User Data:", userData); // Debug: see what's in your DB
      return userData;
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // 2. Improved Helper to get initials (e.g., "Triple X" -> "TX")
  const getInitials = (name) => {
    if (!name || name === 'Loading...') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // 3. Logout function
  const handleLogout = () => {
    localStorage.removeItem('gigGeniusAuth');
    localStorage.removeItem('userEmail'); // Clear the email on logout
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <a href="/Overview" className="flex items-center gap-2 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
              GigGenius
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto flex-1 hide-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath.includes(item.path);
              return (
                <a
                  key={item.name}
                  href={`/${item.path}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* User Profile Dropdown */}
          <div className="relative flex items-center gap-3 flex-shrink-0 border-l pl-4">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* DYNAMIC INITIALS: This will update once the query finishes */}
              {user?.name ? getInitials(user.name) : '...'}
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    {/* DYNAMIC USER INFO */}
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || (error ? 'Guest User' : 'Loading...')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || (error ? 'Please sign in again' : 'Please wait...')}
                    </p>
                  </div>
                  
                  <a href="/AccountSettings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-500" /> 
                    Account Settings
                  </a>
                  
                  <div className="h-px bg-gray-100 my-1" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> 
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}