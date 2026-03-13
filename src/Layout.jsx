import React from 'react';
import { 
  BarChart3, Users, MessageSquare, FolderKanban, Mail, 
  Share2, Globe, UserCog, Target, HeadphonesIcon 
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
  // Read the current URL to know which button to highlight
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Top Navigation Bar */}
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
              // Check if the current URL matches this button's path
              const isActive = currentPath.includes(item.path);
              
              return (
                <a
                  key={item.name}
                  href={`/${item.path}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </a>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3 flex-shrink-0 border-l pl-4">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm">
              LA
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}