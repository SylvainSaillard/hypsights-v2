import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import LoginPage from './pages/auth/LoginPage'; // Import the new LoginPage
import SignupPage from './pages/auth/SignupPage'; // Import the new SignupPage
import LandingPage from './pages/auth/LandingPage'; // Import the new LandingPage
import AboutPage from './pages/auth/AboutPage'; // Import the new AboutPage
import FeaturesPage from './pages/auth/FeaturesPage'; // Import the new FeaturesPage
import PricingPage from './pages/auth/PricingPage'; // Import the new PricingPage
import ContactPage from './pages/auth/ContactPage'; // Import the new ContactPage
import PrivacyPage from './pages/auth/PrivacyPage'; // Import the new PrivacyPage
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; // Import the new ResetPasswordPage
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import EmailConfirmationPage from './pages/auth/EmailConfirmationPage';
import './styles/main.css'; // Import main CSS with design tokens

// Brief and search pages
import BriefCreationPage from './pages/dashboard/BriefCreationPage';
import BriefChatPage from './pages/dashboard/BriefChatPage';
import SimplifiedBriefPage from './pages/dashboard/SimplifiedBriefPage';
import SupplierDetailPage from './pages/dashboard/SupplierDetailPage';
import ProfilePage from './pages/account/ProfilePage';
import SearchResultsPage from './pages/dashboard/SearchResultsPage';

// Debug components
import CorsTest from './components/debug/CorsTest';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Other placeholder components
import NotificationSystem from './components/layout/NotificationSystem';
import HelpContactDropdown from './components/layout/HelpContactDropdown';
import UserProfileDropdown from './components/common/UserProfileDropdown';
import LanguageSelector from './components/layout/LanguageSelector';
import { useI18n } from './contexts/I18nContext';

const DashboardLayout = () => {
  const { t } = useI18n(); // Added for translations
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext will handle redirecting to login via ProtectedRoute
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-hypsights-background">
      <nav className="bg-card shadow-md p-4">
        <div className="container mx-auto max-w-container flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-2xl font-bold text-gray-900">{t('app.name', 'Hypsights')}</span>
            <span className="ml-1 text-sm text-primary font-semibold">Beta</span>
          </Link>
          <div className="flex items-center gap-4 space-x-4">
            {isAdmin && (
              <Link
                to="/dashboard/admin"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Admin
              </Link>
            )}
            <LanguageSelector />
            <HelpContactDropdown />
            <NotificationSystem />
            <UserProfileDropdown user={user} onSignOut={handleLogout} />
          </div>
        </div>
      </nav>
      <main className="container mx-auto max-w-container p-4 md:p-6">
        <Outlet /> 
      </main>
    </div>
  );
};

import KpiCards from './components/dashboard/KpiCards';
import BriefManagementGrid from './components/dashboard/BriefManagementGrid';
import CreateBriefButton from './components/dashboard/CreateBriefButton';

const DashboardOverviewPage = () => {
  const { t, locale } = useI18n(); // Get the t function and locale
  console.log(`DashboardOverviewPage: Current locale: ${locale}, will call t('dashboard.title') directly in JSX.`);
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title', 'Dashboard')}</h1>
        <CreateBriefButton />
      </div>
      
      <KpiCards />
      
      <BriefManagementGrid />
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth(); // Use actual useAuth

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) { // Check for user instead of just isAuthenticated flag
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { user, isLoading } = useAuth();
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading application...</div>;
  }

  if (isRecovery) {
    return <UpdatePasswordPage />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/email-confirmation" element={<EmailConfirmationPage />} />

      {/* Protected Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="debug" element={<CorsTest />} />
        
        {/* Brief management routes */}
        <Route path="briefs/new" element={<BriefCreationPage />} />
        <Route path="briefs/:briefId/edit" element={<BriefCreationPage />} />
        <Route path="briefs/:briefId/chat" element={<BriefChatPage />} />
        <Route path="briefs/:briefId/visual" element={<SimplifiedBriefPage />} />
        <Route path="briefs/:briefId/search" element={<SearchResultsPage />} />
        <Route path="briefs/:briefId/suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;
