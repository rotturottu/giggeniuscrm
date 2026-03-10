import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

export default function Login() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = () => {
    instance.loginRedirect(loginRequest).catch((error) => {
      console.error("Login redirect failed:", error);
    });
  };

  const handleNativeLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }
      
      // SUCCESS! Save a digital ID badge to the browser memory
      localStorage.setItem('gigGeniusAuth', 'true');
      localStorage.setItem('gigGeniusUser', email);
      
      // Teleport to the dashboard
      navigate('/Overview');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
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

        <form className="mt-8 space-y-5" onSubmit={handleNativeLogin}>
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(error) setError(''); }}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(error) setError(''); }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all" 
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              type="button"
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all" 
              onClick={handleMicrosoftLogin}
            >
              Sign In with Microsoft
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-3 text-center pt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Sign up here
            </Link>
          </p>
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}