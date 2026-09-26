import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { getSettings } from '@/lib/game/storage';
import { applyTheme } from '@/lib/game/theme';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import SaveGate from './components/SaveGate';
// Add page imports here
const PageNotFound = lazy(() => import('./lib/PageNotFound'));
// Core game screens load up front so the whole game keeps working if the connection drops.
import Home from './pages/Home';
import Puzzle from './pages/Puzzle';
import Tutorial from './pages/Tutorial';
import Profile from './pages/Profile';
import Store from './pages/Store';
import PrivacyPolicy from './pages/PrivacyPolicy';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <div className="fixed inset-0 bg-background" />;
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <SaveGate>
    <Suspense fallback={null}>
    <Routes location={location}>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Puzzle />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Profile />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/store" element={<Store />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
    </SaveGate>
  );
};


function App() {
  useEffect(() => { applyTheme(getSettings().theme); }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App