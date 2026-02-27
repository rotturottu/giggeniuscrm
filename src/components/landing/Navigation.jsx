import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function Navigation() {
  const handleLoginClick = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png"
            alt="GigGenius"
            className="w-10 h-10 rounded-lg"
          />
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            GigGenius
          </span>
        </div>

        <Button
          onClick={handleLoginClick}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login / Sign Up
        </Button>
      </div>
    </nav>
  );
}