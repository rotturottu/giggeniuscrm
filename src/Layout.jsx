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
  
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';

  // 1. SMART FORMATTER: Handles DB names AND splits email prefixes
  const formatDisplayName = (first, last, email) => {
    let rawName = "";

    if (first || last) {
      // If we have DB names, use them
      rawName = `${first || ''} ${last || ''}`.trim();
    } else {
      // Fallback: Use email prefix (e.g., christianroldan)
      rawName = email.split('@')[0] || 'User';
      
      // regex to detect if it's all one word and try to split it if it looks like a name
      // This is a "best effort" for users without a set first/last name
      if (!rawName.includes(' ') && !rawName.includes('.') && !rawName.includes('_')) {
        // Special case: if prefix is "christianroldan", we can't easily split 
        // without a dictionary, so the DB UPDATE is the real fix.
      }
    }

    // Replace separators with spaces, then split, capitalize, and rejoin
    return rawName
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Splits CamelCase
      .replace(/[._-]/g, ' ')               // Splits dots/dashes
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const { data: user } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const userData = await base44.auth.me();
      return userData;
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    return savedEmail ? savedEmail[0].toUpperCase() : '?';
  };

  const handleLogout = () => {
    localStorage.removeItem('gigGeniusAuth');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const displayName = formatDisplayName(user?.firstName, user?.lastName, savedEmail);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 h-16">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between h-full gap-4">
          
          <a href="/Overview" className="flex items-center gap-2 cursor-pointer flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              G
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
              GigGenius
            </span>
          </a>

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

          <div className="relative flex items-center gap-3 flex-shrink-0 border-l pl-4">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-sm font-bold cursor-pointer shadow-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials()}</span>
              )}
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : getInitials()}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || savedEmail}
                      </p>
                    </div>
                  </div>
                  
                  <a href="/AccountSettings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> 
                    Account Settings
                  </a>
                  
                  <div className="h-px bg-gray-100 my-1" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}