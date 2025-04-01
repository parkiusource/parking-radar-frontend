import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Lazy load components
const HomePage = lazy(() => import('@/pages/HomePage'));
const About = lazy(() => import('@/pages/About'));
const Parking = lazy(() => import('@/pages/Parking'));
const SupportForm = lazy(() => import('@/pages/SupportForm'));
const AdminLandingPage = lazy(() => import('@/pages/AdminLandingPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminGateway = lazy(() => import('@/pages/admin/Gateway'));
const AdminOnboarding = lazy(() => import('@/pages/admin/Onboarding'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/parking" element={<Parking />} />
      <Route path="/support" element={<SupportForm />} />
      <Route path="/admin-landing" element={<AdminLandingPage />} />
      <Route path="/admin" element={<Navigate to="/admin/onboarding" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/gateway" element={<AdminGateway />} />
      <Route path="/admin/onboarding" element={<AdminOnboarding />} />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
