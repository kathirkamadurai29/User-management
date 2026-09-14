import React, { useState } from 'react';
import { api } from '../services/api';
import { CopyIcon, CheckIcon } from './Icons';

export default function AuthView({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login Form State
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [orgName, setOrgName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Copy feedback states
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!clientId.trim() || !clientSecret.trim()) {
      setLoginError('Both Client ID and Client Secret are required.');
      return;
    }

    setLoginLoading(true);
    try {
      const data = await api.login(clientId.trim(), clientSecret.trim());
      onAuthenticated(data.client);
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    if (!orgName.trim()) {
      setRegisterError('Organization/Client name is required.');
      return;
    }

    setRegisterLoading(true);
    try {
      const data = await api.registerClient({
        name: orgName.trim(),
        email: adminEmail.trim() || undefined,
      });
      setCreatedCredentials(data);
      // Pre-fill login credentials
      setClientId(data.client_id);
      setClientSecret(data.client_secret);
    } catch (err) {
      setRegisterError(err.message || 'Client registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold text-base rounded-sm">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tenant<span className="text-slate-500 font-normal">Core</span>
          </h1>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Multi-Tenant User Management & API Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 pb-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setCreatedCredentials(null);
              }}
              className={`flex-1 text-center py-2 text-sm font-medium border-b-2 -mb-[17px] transition-colors ${
                mode === 'login'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In (JWT)
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 text-center py-2 text-sm font-medium border-b-2 -mb-[17px] transition-colors ${
                mode === 'register'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Register Tenant
            </button>
          </div>

          {/* Registration Success Banner with Credentials */}
          {createdCredentials && (
            <div className="mb-6 p-4 border border-emerald-300 bg-emerald-50/50 rounded text-xs space-y-3">
              <div className="flex items-center text-emerald-800 font-medium space-x-1.5">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Tenant Registered in Supabase!</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Save these credentials securely. The client secret is bcrypt-hashed and will not be displayed again.
              </p>

              <div className="space-y-2 pt-1 font-mono">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>CLIENT ID</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.client_id, 'id')}
                      className="text-slate-700 hover:text-slate-900 flex items-center space-x-1"
                    >
                      {copiedId ? <CheckIcon className="w-3 h-3 text-emerald-600" /> : <CopyIcon className="w-3 h-3" />}
                      <span>{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-slate-900 break-all select-all">
                    {createdCredentials.client_id}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>CLIENT SECRET</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdCredentials.client_secret, 'secret')}
                      className="text-slate-700 hover:text-slate-900 flex items-center space-x-1"
                    >
                      {copiedSecret ? <CheckIcon className="w-3 h-3 text-emerald-600" /> : <CopyIcon className="w-3 h-3" />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-slate-900 break-all select-all">
                    {createdCredentials.client_secret}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setCreatedCredentials(null);
                }}
                className="w-full mt-2 py-2 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors"
              >
                Proceed to Sign In with these Credentials →
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="cli_xxxxxxxxxxxx"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  required
                  placeholder="sec_xxxxxxxxxxxxxxxxxxxx"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                {loginLoading ? 'Exchanging Credentials...' : 'Authenticate & Enter Platform'}
              </button>

              <p className="text-[11px] text-slate-500 text-center pt-2">
                Don't have tenant credentials?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-slate-900 underline font-medium"
                >
                  Register a new client
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && !createdCredentials && (
            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
                  {registerError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organization / Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="admin@acme.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                {registerLoading ? 'Provisioning Client...' : 'Generate Client Credentials'}
              </button>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
                Registering stores your client record in Supabase with a bcrypt-hashed secret and creates an isolated tenant namespace for MongoDB user records.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
