import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CloseIcon } from './Icons';

export default function UserModal({ user, isOpen, onClose, onSaved }) {
  const isEdit = Boolean(user?._id);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'member');
      setStatus(user.status || 'active');
    } else {
      setName('');
      setEmail('');
      setRole('member');
      setStatus('active');
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!isEdit && !email.trim()) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.updateUser(user._id, {
          name: name.trim(),
          role,
          status,
        });
      } else {
        await api.createUser({
          name: name.trim(),
          email: email.trim(),
          role,
          status,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md w-full max-w-md p-6 relative">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Edit Tenant User' : 'Add New Tenant User'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Smith"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address {!isEdit && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="email"
              required={!isEdit}
              disabled={isEdit}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@domain.com"
              className={`w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 ${
                isEdit ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
              }`}
            />
            {isEdit && (
              <p className="text-[11px] text-slate-400 mt-1">
                Email address is locked to maintain unique tenant identity.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded text-slate-900 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
