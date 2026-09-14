import React, { useState } from 'react';
import { authStorage } from '../services/api';
import { CopyIcon, CheckIcon } from './Icons';

export default function CredentialsView({ clientInfo }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const token = authStorage.getToken() || '';
  const clientId = clientInfo?.client_id || 'cli_anonymous';

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  const sampleCurl = `curl -X GET ${origin}/api/v1/users \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Client Credentials & Integration
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your tenant API identity and integrate with programmatic HTTP clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Identity Box */}
        <div className="border border-slate-200 rounded-md p-6 bg-white space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
            Tenant Identity
          </h2>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Client ID</span>
              <button
                type="button"
                onClick={() => copy(clientId, setCopiedId)}
                className="text-slate-700 hover:text-slate-900 flex items-center space-x-1"
              >
                {copiedId ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-900 select-all">
              {clientId}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block mb-1">Organization Name</span>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900">
              {clientInfo?.name || 'Registered Organization'}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Active Bearer JWT Token</span>
              <button
                type="button"
                onClick={() => copy(token, setCopiedToken)}
                className="text-slate-700 hover:text-slate-900 flex items-center space-x-1"
              >
                {copiedToken ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-700 break-all select-all max-h-28 overflow-y-auto">
              {token}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
            Your JWT embeds your <span className="font-mono text-slate-900 font-semibold">{clientId}</span> as a cryptographic claim. All database CRUD operations enforce this claim at the query layer.
          </div>
        </div>

        {/* Integration Guide */}
        <div className="border border-slate-200 rounded-md p-6 bg-white space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Direct REST Integration
            </h2>
            <a
              href="/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-slate-900 hover:underline"
            >
              Open Swagger Docs ↗
            </a>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All write and read queries must include your JWT token in the <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Authorization</code> header.
          </p>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium font-mono text-[11px]">Example cURL Request</span>
              <button
                type="button"
                onClick={() => copy(sampleCurl, setCopiedCurl)}
                className="text-slate-700 hover:text-slate-900 flex items-center space-x-1 font-mono text-[11px]"
              >
                {copiedCurl ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto whitespace-pre">
              {sampleCurl}
            </pre>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <h3 className="font-semibold text-slate-900 text-xs">Available Endpoints:</h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 font-mono text-[11px]">
              <li><span className="text-slate-900 font-bold">GET</span> /api/v1/users?search=&status=</li>
              <li><span className="text-slate-900 font-bold">POST</span> /api/v1/users</li>
              <li><span className="text-slate-900 font-bold">GET</span> /api/v1/users/:id</li>
              <li><span className="text-slate-900 font-bold">PUT</span> /api/v1/users/:id</li>
              <li><span className="text-slate-900 font-bold">DELETE</span> /api/v1/users/:id</li>
              <li><span className="text-slate-900 font-bold">GET</span> /api/v1/activity</li>
              <li><span className="text-slate-900 font-bold">GET</span> /api/v1/insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
