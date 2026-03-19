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

// 1. ADDED: Import your public Homepage component! 
import Home from './pages/Home'; // Make sure this path matches your actual file name/location

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
  const isAuth = localStorage.getItem('gigGeniusAuth') === 'true';
  return (
    <Routes>
      {/* 2. FIXED: The Smart Front Door!
          If logged in -> Go to Dashboard (mainPageKey). 
          If NOT logged in -> Show the public Home page. */}
      <Route 
        path="/" 
        element={isAuth ? <Navigate to={`/${mainPageKey}`} replace /> : <Home />} 
      />

      <Route path="/login" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Register" element={<Register />} />

      {/* Dynamic Page Routes */}
      {Object.entries(Pages).map(([path, PageComponent]) => (
        <React.Fragment key={path}>
          {/* 3. FIXED: Added backticks to the dynamic paths */}
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

      {/* 4. FIXED: Changed "" to "*" for the 404 page wildcard */}
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