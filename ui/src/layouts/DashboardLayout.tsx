import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';
import { useNotifications } from '../contexts/notification/NotificationContext';
import NotificationBell from '../components/notifications/NotificationBell';

/**
 * Layout principal pour le dashboard et toutes les pages après authentification
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, tenant, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  
  // Vérifier l'authentification à chaque rendu
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 h-full fixed lg:relative z-10`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center">
            <div className="text-primary-900 font-bold text-xl font-heading">
              {sidebarOpen ? 'ComptaDZ' : 'CZ'}
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="lg:block hidden text-gray-500 hover:text-primary-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="factures" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Factures</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="ocr" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11h-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15h-6" />
                </svg>
                {sidebarOpen && <span className="ml-3">OCR & Classification</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="document-history" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Historique Documents</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="notifications" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {sidebarOpen && (
                  <div className="flex items-center ml-3">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-error text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            </li>
            
            {/* Section Comptabilité */}
            <li className="mt-6">
              {sidebarOpen && <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comptabilité</h3>}
              <ul className="mt-2 space-y-2">
                <li>
                  <NavLink 
                    to="accounting/chart-of-accounts" 
                    className={({ isActive }) => 
                      `flex items-center p-3 rounded-lg transition-colors ${
                        isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {sidebarOpen && <span className="ml-3">Plan Comptable</span>}
                  </NavLink>
                </li>
              </ul>
            </li>
            <li>
              <NavLink 
                to="profile" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Profil</span>}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer avec bouton déconnexion */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="ml-3">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button 
            className="lg:hidden text-gray-500" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center ml-auto">
            {/* Lien Admin Dashboard */}
              <NavLink 
                to="admin/performance-dashboard" 
                className="mr-4 p-1 rounded-full text-gray-500 hover:text-primary-700 hover:bg-gray-100 transition-colors duration-150"
                title="Admin Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 11.428a4.072 4.072 0 01-4.072 4.072H8.644a4.072 4.072 0 01-4.072-4.072V8.644c0-1.33.636-2.563 1.672-3.345L10 2.5l3.728 2.799c1.036.782 1.672 2.015 1.672 3.345v2.784zM10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 12v3.428m5.714-3.428V12A5.714 5.714 0 0010 6.286M4.286 12h2.857" />
                </svg>
              </NavLink>
              {/* Lien Learning Patterns */}
              <NavLink 
                to="admin/learning-patterns" 
                className="mr-4 p-1 rounded-full text-gray-500 hover:text-primary-700 hover:bg-gray-100 transition-colors duration-150"
                title="Learning Patterns"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 6.73812 3.75278 3.75278 3.75278C3.75278 3.75278 1.25278 6.73812 1.25278 9.72347C1.25278 14.8085 6.73812 19.9995 12 21.2472C17.2619 19.9995 22.7472 14.8085 22.7472 9.72347C22.7472 6.73812 20.2472 3.75278 20.2472 3.75278C17.2619 3.75278 12 6.25278 12 6.25278Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75278 13.7472L12 16.2472L20.2472 13.7472"/>
                </svg>
              </NavLink>
              
              {/* Lien Métriques d'explications IA */}
              <NavLink 
                to="admin/explanation-metrics" 
                className="mr-4 p-1 rounded-full text-gray-500 hover:text-primary-700 hover:bg-gray-100 transition-colors duration-150"
                title="Métriques d'explications IA"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </NavLink>
            {/* Notifications */}
            <NotificationBell />
            
            {/* Profil utilisateur */}
            <div className="relative">
              <NavLink to="/profile" className="flex items-center text-gray-700 hover:text-primary-900 focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-900 font-medium">
                  {user?.nom.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="font-medium text-sm">{user?.nom || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500">{tenant?.nom || 'Entreprise'}</p>
                </div>
              </NavLink>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
