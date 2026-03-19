import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Landing from './pages/Home';
import React from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ProtectedRoute = ({ children }) => {
  const isNativeAuth = localStorage.getItem('gigGeniusAuth') === 'true';
  if (!isNativeAuth) return <Navigate to="/login" replace />;
  return children;
};

const AuthenticatedApp = () => {
  const isAuth = localStorage.getItem('gigGeniusAuth') === 'true';

  const renderPage = (path, PageComponent) => (
    <ProtectedRoute>
      <LayoutWrapper currentPageName={path}>
        <PageComponent />
      </LayoutWrapper>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuth ? <Navigate to={`/${mainPageKey}`} replace /> : <Landing />} 
      />

      {['/login', '/Login'].map(path => <Route key={path} path={path} element={<Login />} />)}
      {['/register', '/Register'].map(path => <Route key={path} path={path} element={<Register />} />)}

      {Object.entries(Pages).map(([path, PageComponent]) => (
        <React.Fragment key={path}>
          <Route path={`/${path}`} element={renderPage(path, PageComponent)} />
          <Route path={`/${path.toLowerCase()}`} element={renderPage(path, PageComponent)} />
        </React.Fragment>
      ))}

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

export default App;