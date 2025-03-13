import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load components
const HomePage = lazy(() => import('@/pages/HomePage'));
const About = lazy(() => import('@/pages/About'));
const Admin = lazy(() => import('@/pages/Admin'));
const Features = lazy(() => import('@/pages/Features'));
const Parking = lazy(() => import('@/pages/Parking'));
const SupportForm = lazy(() => import('@/pages/SupportForm'));
const AdminLandingPage = lazy(() => import('@/pages/AdminLandingPage'));

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
      <Route path="/admin" element={<Admin />} />
      <Route path="/features" element={<Features />} />
      <Route path="/parking" element={<Parking />} />
      <Route path="/support" element={<SupportForm />} />
      <Route path="/admin-landing" element={<AdminLandingPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
