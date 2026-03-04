import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  'Sustainability Manager',
  'Facilities Manager',
  'Energy Analyst',
  'Environmental Officer',
  'Operations Manager',
  'C-Suite / Executive',
  'Other',
];

const CompleteProfile = () => {
  const navigate      = useNavigate();
  const { user, setUser } = useAuth();

  // Pre-fill whatever the OAuth provider gave us
  const [form, setForm] = useState({
    fullName:   user?.full_name ?? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
    orgName:    '',
    jobTitle:   user?.job_title ?? '',
    department: user?.department ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim())  { setError('Please enter your name.'); return; }
    if (!form.orgName.trim())   { setError('Please enter your organisation name.'); return; }
    setLoading(true);
    setError('');
    try {
      const updated = await authAPI.updateProfile({
        full_name:         form.fullName.trim(),
        organization_name: form.orgName.trim(),
        job_title:         form.jobTitle.trim() || undefined,
        department:        form.department.trim() || undefined,
      });
      const merged = { ...user, ...updated };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-leaf text-2xl"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900">GreenPulse</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                <i className="fa-solid fa-check text-[10px]"></i>
              </span>
              <span className="text-xs font-medium text-emerald-600">Sign in</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-xs font-medium text-emerald-600">Complete profile</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</span>
              <span className="text-xs font-medium text-gray-400">Dashboard</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h1>
          <p className="text-gray-500 text-sm">Just a couple more details to personalise your dashboard.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Avatar from OAuth (email initial) */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-sm">
              {(user?.email ?? '?')[0].toUpperCase()}
            </div>
          </div>

          {/* Read-only email badge */}
          {user?.email && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-6">
              <i className="fa-solid fa-envelope text-gray-400 text-sm"></i>
              <span className="text-sm text-gray-600 font-medium truncate">{user.email}</span>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">Verified</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={form.fullName}
                onChange={update('fullName')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Alex Johnson"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                Organisation Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="orgName"
                value={form.orgName}
                onChange={update('orgName')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Acme Corp"
                required
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Role / Job Title
                <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="jobTitle"
                value={form.jobTitle}
                onChange={update('jobTitle')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm text-gray-700"
              >
                <option value="">Select your role…</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department / Organisation
                <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="department"
                value={form.department}
                onChange={update('department')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. Sustainability Team"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving…
                </>
              ) : (
                <>
                  Go to Dashboard <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            You can update these details anytime in{' '}
            <button onClick={() => navigate('/settings')} className="text-emerald-600 hover:underline">Settings</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
