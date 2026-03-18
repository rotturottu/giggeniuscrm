import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Login from './pages/Login'; 
import Register from './pages/Register';
import React from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = Pages[mainPageKey] || (() => <></>);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// THE BOUNCER: Added extra logging to debug the "blink"
const ProtectedRoute = ({ children }) => {
  const isNativeAuth = localStorage.getItem('gigGeniusAuth') === 'true';

  if (!isNativeAuth) {
    console.log("Auth failed: Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public Routes - Handles both cases */}
      <Route path="/login" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Register" element={<Register />} />

      {/* Root Path - Redirects immediately to your Dashboard/Overview page */}
      <Route path="/" element={<Navigate to={`/${mainPageKey}`} replace />} />
      
      {/* Dynamic Page Routes */}
      {Object.entries(Pages).map(([path, PageComponent]) => (
        <React.Fragment key={path}>
          {/* Capitalized Route (e.g., /HR) */}
          <Route
            path={`/${path}`}
            element={
              <ProtectedRoute>
                <LayoutWrapper currentPageName={path}>
                  <PageComponent />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          {/* Lowercase Route Alias (e.g., /hr) - STOPS THE BLINKING */}
          <Route
            path={`/${path.toLowerCase()}`}
            element={
              <ProtectedRoute>
                <LayoutWrapper currentPageName={path}>
                  <PageComponent />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        </React.Fragment>
      ))}
      
      {/* Fallback */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <NavigationTracker />
        <AuthenticatedApp />
      </Router>
      <Toaster />
      <VisualEditAgent />
    </QueryClientProvider>
  )
}

export default App