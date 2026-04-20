import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, mlAPI } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', viewer: 'Viewer' };
const ROLE_COLORS = {
  admin:   'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  viewer:  'bg-gray-100 text-gray-600',
};

function ConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete user?</h3>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-medium">{user.first_name} {user.last_name}</span> ({user.email}) will be permanently removed.
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ML Engine panel ──────────────────────────────────────────────────────────
function MLEnginePanel({ showToast }) {
  const [mlStatus, setMlStatus]       = useState(null);
  const [training, setTraining]       = useState(false);
  const [trainAndIng, setTrainAndIng] = useState(false);
  const [anomalies, setAnomalies]     = useState(null);
  const [detecting, setDetecting]     = useState(false);
  const [forecast, setForecast]       = useState(null);
  const [forecasting, setForecasting] = useState(false);
  const [orgs, setOrgs]               = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');   // '' = all orgs

  const orgId = selectedOrg || null;

  // Load orgs for the selector
  useEffect(() => {
    adminAPI.getOrganizations().then(d => setOrgs(d.items ?? [])).catch(() => {});
  }, []);

  const loadStatus = useCallback(async () => {
    try { setMlStatus(await mlAPI.getStatus(orgId)); } catch { /* ignore */ }
  }, [orgId]);

  useEffect(() => { loadStatus(); }, [loadStatus]);
  const orgLabel = selectedOrg
    ? orgs.find(o => String(o.id) === selectedOrg)?.name ?? 'Selected org'
    : 'all organisations';

  const handleTrain = async () => {
    setTraining(true);
    try {
      const result = await mlAPI.train(orgId);
      showToast(`Model trained on ${result.n_samples} samples (${orgLabel})`, 'success');
      loadStatus();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Training failed', 'error');
    } finally {
      setTraining(false);
    }
  };

  const handleTrainAndInsights = async () => {
    setTrainAndIng(true);
    try {
      const result = await mlAPI.trainAndInsights(orgId);
      const insightCount = result.insights?.created ?? result.insights?.length ?? '?';
      showToast(`Trained on ${result.n_samples} samples · ${insightCount} insights generated for ${orgLabel}`, 'success');
      loadStatus();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Train & insights failed', 'error');
    } finally {
      setTrainAndIng(false);
    }
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      setAnomalies(await mlAPI.getAnomalies(orgId));
    } catch (err) {
      showToast(err.response?.data?.detail || 'Detection failed', 'error');
    } finally {
      setDetecting(false);
    }
  };

  const handleForecast = async () => {
    setForecasting(true);
    try {
      const data = await mlAPI.getForecast(orgId);
      // Sample every 4th point for a cleaner chart (168 → 42 points)
      setForecast(data.forecast.filter((_, i) => i % 4 === 0));
    } catch (err) {
      showToast(err.response?.data?.detail || 'Forecast failed', 'error');
    } finally {
      setForecasting(false);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const busy = training || trainAndIng || detecting || forecasting;

  return (
    <div className="space-y-6">

      {/* Organisation selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 text-lg mb-1">Target Organisation</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select an organisation to scope training, anomaly detection, and forecasts to their data only.
          Leave as "All organisations" to train a global model.
        </p>
        <select
          value={selectedOrg}
          onChange={e => { setSelectedOrg(e.target.value); setAnomalies(null); setForecast(null); }}
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">All organisations (global model)</option>
          {orgs.map(o => (
            <option key={o.id} value={String(o.id)}>
              {o.name} — {o.user_count} user{o.user_count !== 1 ? 's' : ''}, {o.reading_count} readings
            </option>
          ))}
        </select>

        {/* One-click: Train + Generate Insights */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <button
            onClick={handleTrainAndInsights}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
          >
            {trainAndIng ? <><Spinner /> Working…</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Train &amp; Generate Insights</>}
          </button>
          <p className="text-xs text-gray-400">
            Trains the model on {orgLabel}'s energy data, then auto-generates AI Insight records that appear on their dashboard.
          </p>
        </div>
      </div>

      {/* Model Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">ML Model Status</h2>
            <p className="text-sm text-gray-500 mt-0.5">IsolationForest (anomaly) + GradientBoosting (forecast)</p>
          </div>
          <button
            onClick={handleTrain}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {training ? <><Spinner /> Training…</> : <><i className="fa-solid fa-brain"></i> Train Only</>}
          </button>
        </div>

        {mlStatus === null ? (
          <p className="text-sm text-gray-400">Loading status…</p>
        ) : mlStatus.trained ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Trained
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Last Trained</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(mlStatus.trained_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Training Samples</p>
              <p className="text-sm font-semibold text-gray-800">{mlStatus.n_samples?.toLocaleString()} readings</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
            <p className="text-sm text-gray-600">No model trained yet. Click <strong>Train Model</strong> to get started.</p>
          </div>
        )}
      </div>

      {/* Anomaly Detection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">Anomaly Detection</h2>
            <p className="text-sm text-gray-500 mt-0.5">Scan last 7 days of energy readings for outliers</p>
          </div>
          <button
            onClick={handleDetect}
            disabled={busy || !mlStatus?.trained}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40"
            title={!mlStatus?.trained ? 'Train the model first' : `Scanning ${orgLabel}`}
          >
            {detecting ? <><Spinner /> Detecting…</> : <><i className="fa-solid fa-magnifying-glass-chart"></i> Detect Anomalies</>}
          </button>
        </div>

        {anomalies === null ? (
          <p className="text-sm text-gray-400">Run detection to see results.</p>
        ) : anomalies.anomaly_count === 0 ? (
          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
            <i className="fa-solid fa-check-circle text-emerald-500"></i>
            <p className="text-sm text-gray-700">No anomalies detected in the last 7 days ({anomalies.total_checked} readings checked).</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Found <span className="font-semibold text-red-600">{anomalies.anomaly_count}</span> anomalies out of {anomalies.total_checked} readings.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                    <th className="px-4 py-2 text-left">Zone</th>
                    <th className="px-4 py-2 text-right">kWh</th>
                    <th className="px-4 py-2 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {anomalies.anomalies.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(a.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-2 text-gray-800 font-medium">{a.zone}</td>
                      <td className="px-4 py-2 text-right text-gray-800">{a.consumption_kwh}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${a.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {a.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">7-Day Energy Forecast</h2>
            <p className="text-sm text-gray-500 mt-0.5">Linear regression prediction for the next 168 hours</p>
          </div>
          <button
            onClick={handleForecast}
            disabled={busy || !mlStatus?.trained}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
            title={!mlStatus?.trained ? 'Train the model first' : `Forecasting for ${orgLabel}`}
          >
            {forecasting ? <><Spinner /> Running…</> : <><i className="fa-solid fa-chart-line"></i> Run Forecast</>}
          </button>
        </div>

        {forecast === null ? (
          <p className="text-sm text-gray-400">Run forecast to see the 7-day prediction chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecast} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={v => new Date(v).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval={5}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${v} kWh`} width={70} />
              <Tooltip
                formatter={v => [`${v} kWh`, 'Predicted']}
                labelFormatter={l => new Date(l).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              />
              <Area
                type="monotone"
                dataKey="predicted_kwh"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#forecastGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate();
  const { user: currentUser, hasRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]     = useState('users');
  const [users, setUsers]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [offset, setOffset]           = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updating, setUpdating]       = useState({});
  const LIMIT = 20;

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && !hasRole('admin')) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, hasRole, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers(LIMIT, offset);
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [offset, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setUpdatingFor = (id, key, val) =>
    setUpdating(prev => ({ ...prev, [`${id}-${key}`]: val }));

  const handleRoleChange = async (userId, role) => {
    setUpdatingFor(userId, 'role', true);
    try {
      const updated = await adminAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      showToast('Role updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update role', 'error');
    } finally {
      setUpdatingFor(userId, 'role', false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setUpdatingFor(userId, 'status', true);
    try {
      const updated = await adminAPI.toggleStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: updated.is_active } : u));
      showToast(`User ${updated.is_active ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingFor(userId, 'status', false);
    }
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await adminAPI.deleteUser(target.id);
      showToast('User deleted', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete user', 'error');
    }
  };

  const initials = (u) =>
    `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || '?';

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {deleteTarget && (
        <ConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage user accounts, roles, and ML engine.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'users', label: 'User Management', icon: 'fa-users' },
            { key: 'ml',    label: 'ML Engine',        icon: 'fa-brain'  },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={`fa-solid ${icon}`}></i> {label}
            </button>
          ))}
        </div>

        {activeTab === 'ml' ? (
          <MLEnginePanel showToast={showToast} />
        ) : (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: total },
                { label: 'Admins',    value: users.filter(u => u.role?.toUpperCase() === 'ADMIN').length },
                { label: 'Managers',  value: users.filter(u => u.role?.toUpperCase() === 'MANAGER').length },
                { label: 'Active',    value: users.filter(u => u.is_active).length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '—' : value}</p>
                </div>
              ))}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Users</h2>
                <span className="text-sm text-gray-400">{total} total</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-400 text-sm">Loading users…</div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Role</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Joined</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => {
                        const isSelf = u.id === currentUser?.id;
                        const roleUpdating   = updating[`${u.id}-role`];
                        const statusUpdating = updating[`${u.id}-status`];

                        return (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">

                            {/* User cell */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                  {initials(u)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {u.first_name} {u.last_name}
                                    {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                                  </p>
                                  <p className="text-gray-400 text-xs">{u.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role cell */}
                            <td className="px-6 py-4">
                              {isSelf ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                                  {ROLE_LABELS[u.role]}
                                </span>
                              ) : (
                                <select
                                  value={u.role}
                                  disabled={roleUpdating}
                                  onChange={e => handleRoleChange(u.id, e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="manager">Manager</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>

                            {/* Status cell */}
                            <td className="px-6 py-4">
                              <button
                                onClick={() => !isSelf && handleToggleStatus(u.id, u.is_active)}
                                disabled={isSelf || statusUpdating}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${u.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                title={isSelf ? 'Cannot deactivate your own account' : (u.is_active ? 'Deactivate' : 'Activate')}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${u.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </td>

                            {/* Joined cell */}
                            <td className="px-6 py-4 text-gray-400 text-xs">
                              {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>

                            {/* Actions cell */}
                            <td className="px-6 py-4 text-right">
                              {!isSelf && (
                                <button
                                  onClick={() => setDeleteTarget(u)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                      disabled={offset === 0}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setOffset(o => o + LIMIT)}
                      disabled={offset + LIMIT >= total}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
