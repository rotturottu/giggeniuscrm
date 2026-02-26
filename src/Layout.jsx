import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Target,
  BarChart3,
  Mail,
  Share2,
  Settings,
  LogOut,
  MessageSquare,
  DollarSign,
  FolderKanban,
  Menu,
  Users,
  Globe,
  UserCog,
  HeadphonesIcon,
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

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

  const isActive = (pageName) => currentPageName === pageName;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* PWA Meta Tags */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (display-mode: standalone) {
            body { padding-top: env(safe-area-inset-top); }
          }
        `
      }} />

      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png"
                  alt="GigGenius"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
                />
                <span className="hidden lg:inline text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GigGenius
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={createPageUrl(item.path)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${
                          active
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden xl:inline">{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link 
                          key={item.path} 
                          to={createPageUrl(item.path)}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 ${
                              active
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm">
                        {getInitials(user?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('AccountSettings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="pb-safe">{children}</main>
    </div>
  );
}