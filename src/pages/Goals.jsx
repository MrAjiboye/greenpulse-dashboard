import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { goalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useScrollReveal from '../hooks/useScrollReveal';

const CATEGORY_META = {
  ENERGY: { label: 'Energy',  icon: 'fa-solid fa-bolt',    color: 'bg-yellow-100 text-yellow-700' },
  WASTE:  { label: 'Waste',   icon: 'fa-solid fa-trash',   color: 'bg-blue-100 text-blue-700'   },
  CARBON: { label: 'Carbon',  icon: 'fa-solid fa-leaf',    color: 'bg-emerald-100 text-emerald-700' },
};

const UNIT_DEFAULTS = { ENERGY: 'kWh', WASTE: 'kg', CARBON: 'tCO2' };

const STATUS_META = {
  on_track: { label: 'On Track',  bg: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  at_risk:  { label: 'At Risk',   bg: 'bg-orange-100 text-orange-700',   bar: 'bg-orange-500'  },
  exceeded: { label: 'Exceeded',  bg: 'bg-red-100 text-red-700',         bar: 'bg-red-500'     },
};

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const BLANK = { name: '', category: 'ENERGY', target_value: '', unit: 'kWh', period_start: '', period_end: '' };

export default function Goals() {
  useScrollReveal();
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isManager = hasRole('MANAGER', 'ADMIN');

  const [goals, setGoals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const load = () => {
    setLoading(true);
    goalsAPI.getList()
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load goals', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (g) => {
    setForm({
      name: g.name,
      category: g.category,
      target_value: g.target_value,
      unit: g.unit,
      period_start: g.period_start?.slice(0, 10) ?? '',
      period_end:   g.period_end?.slice(0, 10) ?? '',
    });
    setEditId(g.id);
    setShowForm(true);
  };

  const handleCategoryChange = (cat) => {
    setForm(f => ({ ...f, category: cat, unit: UNIT_DEFAULTS[cat] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        target_value: parseFloat(form.target_value),
        period_start: new Date(form.period_start).toISOString(),
        period_end:   new Date(form.period_end).toISOString(),
      };
      if (editId) {
        await goalsAPI.update(editId, payload);
        showToast('Goal updated', 'success');
      } else {
        await goalsAPI.create(payload);
        showToast('Goal created', 'success');
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save goal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await goalsAPI.delete(id);
      showToast('Goal deleted', 'success');
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch {
      showToast('Failed to delete goal', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sustainability Goals</h1>
            <p className="text-gray-500 mt-1">Track progress toward your organisation's targets</p>
          </div>
          {isManager && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-sm transition-all"
            >
              <i className="fa-solid fa-plus"></i> Add Goal
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-5">{editId ? 'Edit Goal' : 'New Goal'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Reduce Zone A energy by 15%"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="ENERGY">Energy (kWh)</option>
                  <option value="WASTE">Waste (kg)</option>
                  <option value="CARBON">Carbon (tCO₂)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value <span className="text-gray-400">({form.unit})</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form.target_value}
                  onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                <input
                  required
                  type="date"
                  value={form.period_start}
                  onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                <input
                  required
                  type="date"
                  value={form.period_end}
                  onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving…' : (editId ? 'Update Goal' : 'Create Goal')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-48 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-6"></div>
                <div className="h-2 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <i className="fa-solid fa-bullseye text-emerald-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No goals yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              {isManager ? 'Create your first sustainability target.' : 'Your manager hasn\'t set any goals yet.'}
            </p>
            {isManager && (
              <button onClick={openAdd} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl">
                Add Goal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(g => {
              const cat    = CATEGORY_META[g.category] ?? CATEGORY_META.ENERGY;
              const st     = STATUS_META[g.status]     ?? STATUS_META.on_track;
              const pct    = Math.min(g.progress_pct, 100);

              return (
                <div key={g.id} className="reveal card-hover bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.color}`}>
                        <i className={`${cat.icon} text-xs`}></i> {cat.label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.bg}`}>{st.label}</span>
                    </div>
                    {isManager && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          disabled={deleting === g.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 leading-snug">{g.name}</h3>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{Number(g.actual_value).toLocaleString()} {g.unit}</span>
                      <span>Target: {Number(g.target_value).toLocaleString()} {g.unit}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${st.bar}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{g.progress_pct.toFixed(1)}% of target</p>
                  </div>

                  {/* Period */}
                  <p className="text-xs text-gray-400">
                    <i className="fa-regular fa-calendar mr-1"></i>
                    {formatDate(g.period_start)} – {formatDate(g.period_end)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-xs"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
