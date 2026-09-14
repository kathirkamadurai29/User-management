import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshIcon } from './Icons';

export default function ActivityView() {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Insights State
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState('');

  const fetchActivity = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getActivity();
      setMetrics(data.metrics || null);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve activity telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    setInsightLoading(true);
    setInsightError('');
    try {
      const res = await api.getInsights();
      setInsight(res);
    } catch (err) {
      setInsightError(err.message || 'Failed to generate AI insight.');
    } finally {
      setInsightLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tenant Telemetry & Activity
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time audit log stream captured in MongoDB with automated LLM synthesis.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchActivity}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshIcon className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-200 rounded-md p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Total Tenant Requests</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {metrics?.total_requests ?? '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Scoped to this client_id</div>
        </div>

        <div className="border border-slate-200 rounded-md p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Success Rate</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {metrics ? `${metrics.success_rate_percent}%` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {metrics?.status_2xx ?? 0} successful 2xx responses
          </div>
        </div>

        <div className="border border-slate-200 rounded-md p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Client Exceptions (4xx)</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {metrics?.status_4xx ?? '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Validation / auth rejections</div>
        </div>

        <div className="border border-slate-200 rounded-md p-4 bg-white">
          <div className="text-xs text-slate-500 font-medium">Server Faults (5xx)</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {metrics?.status_5xx ?? '0'}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Zero internal crashes</div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="border border-slate-200 rounded-md bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <h2 className="text-sm font-semibold text-slate-900">AI Activity Insights</h2>
              <span className="text-[10px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                GET /insights
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Synthesizes recent operational logs into an executive summary via LLM.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateInsight}
            disabled={insightLoading}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
          >
            {insightLoading ? 'Analyzing Logs...' : 'Generate AI Summary'}
          </button>
        </div>

        {insightError && (
          <div className="mt-4 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
            {insightError}
          </div>
        )}

        {insight ? (
          <div className="mt-4 p-4 border border-slate-200 bg-slate-50/50 rounded-md space-y-3">
            <p className="text-xs text-slate-800 leading-relaxed font-normal">
              "{insight.insight}"
            </p>
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-mono">
              <span>Sampled: {insight.sample_count} events</span>
              <span>Model Provider: {insight.provider}</span>
              <span>Generated: {new Date(insight.generated_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
            Click "Generate AI Summary" to summarize tenant activity.
          </div>
        )}
      </div>

      {/* Activity Stream Table */}
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Recent Audit Stream ({logs.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">MongoDB activity_logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50/60 text-slate-500 font-medium">
              <tr>
                <th scope="col" className="px-4 py-2.5">Timestamp</th>
                <th scope="col" className="px-4 py-2.5">Method</th>
                <th scope="col" className="px-4 py-2.5">Endpoint</th>
                <th scope="col" className="px-4 py-2.5">Status</th>
                <th scope="col" className="px-4 py-2.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => {
                  const s = log.status || 200;
                  const is2xx = s >= 200 && s < 300;
                  const is4xx = s >= 400 && s < 500;
                  return (
                    <tr key={log._id || idx} className="hover:bg-slate-50/50 transition-colors font-mono">
                      <td className="px-4 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.method === 'GET'
                              ? 'bg-slate-100 text-slate-700'
                              : log.method === 'POST'
                              ? 'bg-blue-50 text-blue-700'
                              : log.method === 'PUT'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.method}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 text-[11px]">{log.endpoint}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            is2xx
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : is4xx
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500 text-[11px] whitespace-nowrap">
                        {log.duration_ms !== undefined ? `${log.duration_ms}ms` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
