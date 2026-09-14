import React from 'react';
import { CloseIcon, CopyIcon } from './Icons';

export default function UserDetailModal({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(user, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg p-6 relative">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-slate-500 block font-medium mb-1">User ID (MongoDB)</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 select-all block break-all">
                {user._id}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-1">Tenant ID (Hard Scoped)</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 select-all block break-all">
                {user.client_id}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-slate-500 block font-medium mb-1">Assigned Role</span>
              <span className="inline-block font-medium uppercase tracking-wider text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {user.role}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-1">Lifecycle Status</span>
              <span
                className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  user.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : user.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user.status === 'active'
                      ? 'bg-emerald-500'
                      : user.status === 'pending'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="capitalize">{user.status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-slate-600">
            <div>
              <span className="text-slate-500 block font-medium mb-0.5">Created At</span>
              <span>{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium mb-0.5">Last Updated</span>
              <span>{new Date(user.updated_at || user.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Raw JSON viewer */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-medium">MongoDB Document Payload</span>
              <button
                type="button"
                onClick={copyJson}
                className="text-slate-600 hover:text-slate-900 flex items-center space-x-1 font-mono text-[11px]"
              >
                <CopyIcon className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
