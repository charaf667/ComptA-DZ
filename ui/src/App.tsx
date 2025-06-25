import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/auth/AuthContext';
import { NotificationProvider } from './contexts/notification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthBasedRedirect from './components/auth/AuthBasedRedirect';

// Page d'accueil
const LandingPage = lazy(() => import('./pages/LandingPage').catch(error => {
  console.error('Erreur de chargement du module LandingPage:', error);
  return { default: () => <div>Erreur de chargement de la page d'accueil</div> };
}));

// Layouts
const AuthLayout = lazy(() => import('./layouts/AuthLayout').catch(error => {
  console.error('Erreur de chargement du module AuthLayout:', error);
  return { default: () => <div>Erreur de chargement du layout d'authentification</div> };
}));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').catch(error => {
  console.error('Erreur de chargement du module DashboardLayout:', error);
  return { default: () => <div>Erreur de chargement du layout principal</div> };
}));

// Pages - Dashboard
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard').catch(error => {
  console.error('Erreur de chargement du module Dashboard:', error);
  return { default: () => <div>Erreur de chargement du tableau de bord</div> };
}));
const Factures = lazy(() => import('./pages/factures/Factures').catch(error => {
  console.error('Erreur de chargement du module Factures:', error);
  return { default: () => <div>Erreur de chargement de la page des factures</div> };
}));
const Profile = lazy(() => import('./pages/profile/Profile').catch(error => {
  console.error('Erreur de chargement du module Profile:', error);
  return { default: () => <div>Erreur de chargement du profil</div> };
}));
const OcrPage = lazy(() => import('./pages/ocr/OcrPage').catch(error => {
  console.error('Erreur de chargement du module OcrPage:', error);
  return { default: () => <div>Erreur de chargement de la page OCR</div> };
}));
const DocumentHistoryPage = lazy(() => import('./pages/document-history/DocumentHistoryPage').catch(error => {
  console.error('Erreur de chargement du module DocumentHistoryPage:', error);
  return { default: () => <div>Erreur de chargement de la page d'historique des documents</div> };
}));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').catch(error => {
  console.error('Erreur de chargement du module NotificationsPage:', error);
  return { default: () => <div>Erreur de chargement de la page des notifications</div> };
}));

// Pages - Comptabilité
const ChartOfAccountsPage = lazy(() => import('./pages/accounting/ChartOfAccountsPage').catch(error => {
  console.error('Erreur de chargement du module ChartOfAccountsPage:', error);
  return { default: () => <div>Erreur de chargement du plan comptable</div> };
}));

// Pages - Admin
const PerformanceDashboard = lazy(() => import('./pages/admin/PerformanceDashboard').catch(error => {
  console.error('Erreur de chargement du module PerformanceDashboard:', error);
  return { default: () => <div>Erreur de chargement du tableau de bord des performances</div> };
}));
const LearningPatternsPage = lazy(() => import('./pages/admin/LearningPatternsPage').catch(error => {
  console.error('Erreur de chargement du module LearningPatternsPage:', error);
  return { default: () => <div>Erreur de chargement de la page des patterns d\'apprentissage</div> };
}));
const ExplanationMetricsPage = lazy(() => import('./pages/admin/ExplanationMetricsPage').catch(error => {
  console.error('Erreur de chargement du module ExplanationMetricsPage:', error);
  return { default: () => <div>Erreur de chargement de la page des métriques d\'explications IA</div> };
}));

// Loading Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/auth/*" element={<AuthLayout />} />
              
              {/* Routes protégées */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/*" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="factures" element={<Factures />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="ocr" element={<OcrPage />} />
                  <Route path="document-history" element={<DocumentHistoryPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
                  <Route path="admin/performance-dashboard" element={<PerformanceDashboard />} />
                  <Route path="admin/learning-patterns" element={<LearningPatternsPage />} />
                  <Route path="admin/explanation-metrics" element={<ExplanationMetricsPage />} />
                </Route>
              </Route>
              
              {/* Redirections intelligentes */}
              <Route path="/" element={<AuthBasedRedirect />} />
              <Route path="*" element={<AuthBasedRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
