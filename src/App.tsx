import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import LoginPage from './pages/auth/LoginPage'; // Import the new LoginPage
import SignupPage from './pages/auth/SignupPage'; // Import the new SignupPage
import LandingPage from './pages/auth/LandingPage'; // Import the new LandingPage
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; // Import the new ResetPasswordPage
import './styles/main.css'; // Import main CSS with design tokens

// Brief and search pages
import BriefCreationPage from './pages/dashboard/BriefCreationPage';
import BriefChatPage from './pages/dashboard/BriefChatPage';
import SimplifiedBriefPage from './pages/dashboard/SimplifiedBriefPage';
import SearchResultsPage from './pages/dashboard/SearchResultsPage';

// Debug components
import CorsTest from './components/debug/CorsTest';

// Other placeholder components
import NotificationSystem from './components/layout/NotificationSystem';
import LanguageSelector from './components/layout/LanguageSelector';

const DashboardLayout = () => {
  const { t } = useI18n(); // Added for translations
  const { user, logout } = useAuth();
  
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
            <img src="https://lmqagaenmseopcctkrwv.supabase.co/storage/v1/object/public/assets/logo_hypsights_v2-removebg-preview.png" alt="Hypsights Logo" className="h-16 w-auto" />
            
          </Link>
          <div className="flex items-center gap-4 space-x-4">
            <div className="flex space-x-2">
              <Link to="/dashboard" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100">{t('nav.dashboard', 'Dashboard')}</Link>
              <Link to="/dashboard/debug" className="px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-primary">{t('nav.debug', 'Debug')}</Link>
            </div>
            <LanguageSelector />
            <NotificationSystem />
            {user && <span className="text-sm hidden md:inline">{t('user.logged_in_as', 'Logged in as:')} {user.email}</span>}
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-700"
            >
              {t('action.sign_out', 'Sign out')}
            </button>
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
import { useI18n } from './contexts/I18nContext'; // Import useI18n

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
      
      {/* <div className="mb-8 bg-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.recent_activity.title', 'Recent Activity')}</h2>
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 text-center">
          {t('dashboard.recent_activity.placeholder', 'Your recent activities will appear here')}
        </div>
      </div> */}
      
      <BriefManagementGrid />
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth(); // Use actual useAuth

  if (isLoading) {
    // You can return a loading spinner or a blank page here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) { // Check for user instead of just isAuthenticated flag
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { user, isLoading } = useAuth(); // Use actual useAuth

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading application...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPasswordPage />} />

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
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;

