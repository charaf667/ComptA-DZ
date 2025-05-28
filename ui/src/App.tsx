import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

// Pages - Auth
const Login = lazy(() => import('./pages/auth/Login').catch(error => {
  console.error('Erreur de chargement du module Login:', error);
  return { default: () => <div>Erreur de chargement de la page de connexion</div> };
}));
const Register = lazy(() => import('./pages/auth/Register').catch(error => {
  console.error('Erreur de chargement du module Register:', error);
  return { default: () => <div>Erreur de chargement de la page d'inscription</div> };
}));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').catch(error => {
  console.error('Erreur de chargement du module ForgotPassword:', error);
  return { default: () => <div>Erreur de chargement de la page de récupération de mot de passe</div> };
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

// Loading Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Landing Page - Public */}
            <Route path="/welcome" element={<LandingPage />} />
            
            {/* Auth Routes - Public */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route index element={<Navigate to="/auth/login" replace />} />
            </Route>
            
            {/* Protected Dashboard Routes - Need authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="factures" element={<Factures />} />
                <Route path="profile" element={<Profile />} />
                <Route path="ocr" element={<OcrPage />} />
                <Route path="document-history" element={<DocumentHistoryPage />} />
              </Route>
            </Route>

            {/* Default Route - Redirect to welcome page */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
