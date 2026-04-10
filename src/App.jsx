import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';

// Pages
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import EnergyMonitor from './pages/EnergyMonitor';
import WasteManagement from './pages/WasteManagement';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import RecommendationDetails from './pages/RecommendationDetails';
import ApplyRecommendation from './pages/ApplyRecommendation';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Notifications from './pages/Notifications';
import OAuthCallback from './pages/OAuthCallback';
import CompleteProfile from './pages/CompleteProfile';
import CarbonFootprint from './pages/CarbonFootprint';
import Goals from './pages/Goals';
import DataImport from './pages/DataImport';
import TeamMembers from './pages/TeamMembers';
import AcceptInvite from './pages/AcceptInvite';
import VerifyEmailSent from './pages/VerifyEmailSent';
import VerifyEmail from './pages/VerifyEmail';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPost1 from './pages/BlogPost1';
import BlogPost2 from './pages/BlogPost2';
import BlogPost3 from './pages/BlogPost3';
import StoriesPage from './pages/StoriesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import AdminPanel from './pages/AdminPanel';
import IoTDocs from './pages/IoTDocs';
import IoTFeed from './pages/IoTFeed';
import GlossaryPage from './pages/GlossaryPage';
import PricingPage from './pages/PricingPage';
import BookDemoPage from './pages/BookDemoPage';
import EnergySignatures from './pages/EnergySignatures';

function TopProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!visible) return null;
  return <div className="top-progress-bar" />;
}

function AnimatedRoutes() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleExpiry = () => {
      logout();
      showToast('Your session has expired. Please sign in again.', 'warning');
      navigate('/signin', { replace: true });
    };
    window.addEventListener('auth:session-expired', handleExpiry);
    return () => window.removeEventListener('auth:session-expired', handleExpiry);
  }, [logout, showToast, navigate]);

  return (
    <div className="page-transition">
      <TopProgressBar />
      <CookieBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/1" element={<BlogPost1 />} />
        <Route path="/blog/2" element={<BlogPost2 />} />
        <Route path="/blog/3" element={<BlogPost3 />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/demo" element={<BookDemoPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/energy" element={
          <ProtectedRoute>
            <EnergyMonitor />
          </ProtectedRoute>
        } />

        <Route path="/waste" element={
          <ProtectedRoute>
            <WasteManagement />
          </ProtectedRoute>
        } />

        <Route path="/insights" element={
          <ProtectedRoute>
            <AIInsights />
          </ProtectedRoute>
        } />

        <Route path="/carbon" element={
          <ProtectedRoute>
            <CarbonFootprint />
          </ProtectedRoute>
        } />

        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />

        <Route path="/import" element={
          <ProtectedRoute>
            <DataImport />
          </ProtectedRoute>
        } />

        <Route path="/team" element={
          <ProtectedRoute>
            <TeamMembers />
          </ProtectedRoute>
        } />

        <Route path="/accept-invite" element={<AcceptInvite />} />


        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/recommendation/:id" element={
          <ProtectedRoute>
            <RecommendationDetails />
          </ProtectedRoute>
        } />

        <Route path="/apply-recommendation/:id" element={
          <ProtectedRoute>
            <ApplyRecommendation />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />

        {/* Glossary — public */}
        <Route path="/glossary" element={<GlossaryPage />} />

        {/* IoT Docs — public */}
        <Route path="/docs/iot" element={<IoTDocs />} />

        <Route path="/iot-feed" element={
          <ProtectedRoute>
            <IoTFeed />
          </ProtectedRoute>
        } />

        <Route path="/energy-signatures" element={
          <ProtectedRoute>
            <EnergySignatures />
          </ProtectedRoute>
        } />

        {/* 404 — unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                <AnimatedRoutes />
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;