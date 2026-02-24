import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(false);
  };

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen onSuccess={handleSuccess} onAdminLogin={handleAdminLogin} />
      ) : (
        <Dashboard isAdmin={isAdmin} onLogout={handleLogout} />
      )}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
