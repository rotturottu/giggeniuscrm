import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

export default function Login() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Overview');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error("Login redirect failed:", error);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png"
            alt="GigGenius"
            className="w-16 h-16 mx-auto rounded-xl mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in securely to your dashboard</p>
        </div>
        <div className="mt-8 space-y-4">
          <Button 
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all" 
            onClick={handleLogin}
          >
            Sign In with Microsoft
          </Button>
          <div className="text-center pt-4">
            <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}