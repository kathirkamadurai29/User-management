import React from 'react';

export default function Header({ activeTab, setActiveTab, clientInfo, onSignOut }) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Active Tenant */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight rounded-sm">
                T
              </div>
              <span className="font-semibold tracking-tight text-slate-900 text-base">
                Tenant<span className="text-slate-400 font-normal">Core</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 pl-4 border-l border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Tenant:</span>
              <span className="text-slate-900 font-semibold">{clientInfo?.name || 'Authorized Client'}</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-200">
                {clientInfo?.client_id}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'users'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'activity'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Activity & AI
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'credentials'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              API Credentials
            </button>

            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center px-3 py-1 text-xs font-mono text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:border-slate-300 ml-2"
            >
              Swagger Docs ↗
            </a>

            <button
              onClick={onSignOut}
              className="ml-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
