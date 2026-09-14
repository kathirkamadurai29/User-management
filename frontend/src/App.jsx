import React, { useState, useEffect } from 'react';
import { authStorage } from './services/api';
import Header from './components/Header';
import AuthView from './components/AuthView';
import UsersView from './components/UsersView';
import ActivityView from './components/ActivityView';
import CredentialsView from './components/CredentialsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authStorage.isAuthenticated());
  const [clientInfo, setClientInfo] = useState(authStorage.getClient());
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setClientInfo(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleAuthenticated = (client) => {
    setIsAuthenticated(true);
    setClientInfo(client || authStorage.getClient());
  };

  const handleSignOut = () => {
    authStorage.clear();
    setIsAuthenticated(false);
    setClientInfo(null);
  };

  if (!isAuthenticated) {
    return <AuthView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientInfo={clientInfo}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        {activeTab === 'users' && <UsersView />}
        {activeTab === 'activity' && <ActivityView />}
        {activeTab === 'credentials' && <CredentialsView clientInfo={clientInfo} />}
      </main>

      <footer className="border-t border-slate-200 py-6 bg-slate-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <div>
            TenantCore Platform &copy; {new Date().getFullYear()} — Multi-tenant Isolation Architecture
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              API Online
            </span>
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-slate-900 underline font-mono text-[11px]"
            >
              OpenAPI Specification
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
