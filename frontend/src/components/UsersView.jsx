import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, RefreshIcon } from './Icons';
import UserModal from './UserModal';
import UserDetailModal from './UserDetailModal';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);

  // Deactivate state
  const [deactivatingId, setDeactivatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers({
        search,
        status: statusFilter,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load tenant users.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [fetchUsers]);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate user "${name}"? This performs a soft-delete scoped to your tenant and triggers a Firebase Admin event.`)) {
      return;
    }
    setDeactivatingId(id);
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      alert(`Deactivation failed: ${err.message}`);
    } finally {
      setDeactivatingId(null);
    }
  };

  const statusPills = [
    { label: 'All Users', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with count and primary action */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Tenant Users</h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated tenant directory in MongoDB. Showing {users.length} of {total} registered accounts.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh Users"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-none"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Add User
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 border border-slate-200 rounded p-0.5 bg-slate-50 self-start sm:self-auto">
          {statusPills.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setStatusFilter(pill.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                statusFilter === pill.value
                  ? 'bg-white text-slate-900 border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mt-4 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="mt-6 border border-slate-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th scope="col" className="px-4 py-3">User</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">Created</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    Loading users for tenant...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <p className="text-slate-600 font-medium mb-1">No users found</p>
                    <p className="text-slate-400 text-[11px] mb-4">
                      {search || statusFilter !== 'all'
                        ? 'Try clearing your search or status filters.'
                        : 'Your tenant directory is currently empty.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-900 border border-slate-300 rounded hover:bg-slate-50"
                    >
                      Add First User
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : u.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-500'
                              : u.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{u.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDetailUser(u)}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 inline-flex items-center"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                        title="Edit User"
                        className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 inline-flex items-center"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeactivate(u._id, u.name)}
                        disabled={deactivatingId === u._id}
                        title="Deactivate (Soft Delete)"
                        className="p-1.5 text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded hover:bg-rose-50 inline-flex items-center disabled:opacity-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        user={editingUser}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSaved={fetchUsers}
      />

      <UserDetailModal
        user={detailUser}
        isOpen={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
      />
    </div>
  );
}
