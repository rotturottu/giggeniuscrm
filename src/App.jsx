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

// --- MICROSOFT AZURE BYPASSED ---
// import { PublicClientApplication } from '@azure/msal-browser';
// import { MsalProvider, useMsal } from '@azure/msal-react';
// import { msalConfig } from './authConfig';
// const msalInstance = new PublicClientApplication(msalConfig);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// THE BOUNCER: Protected Route (Native Auth Only)
const ProtectedRoute = ({ children }) => {
  // Check for Native Local Account (The badge we set in Login.jsx)
  const isNativeAuth = localStorage.getItem('gigGeniusAuth') === 'true';

  if (!isNativeAuth) {
    // Kick them to the login page
    return <Navigate to="/login" replace />;
  }

  // If they pass the check, let them view the page
  return children;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        </ProtectedRoute>
      } />
      
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <ProtectedRoute>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    // <MsalProvider instance={msalInstance}> --- REMOVED ---
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    // </MsalProvider>
  )
}

export default App