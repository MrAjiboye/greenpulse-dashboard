import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, octopusAPI } from '../services/api';
import NavBar from '../components/NavBar';

const PREFS_KEY = 'greenpulse_preferences';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

const Settings = () => {
  const { user, setUser, logout, hasRole } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [companyName, setCompanyName] = useState('');
  const [iotKeyCopied, setIotKeyCopied] = useState(false);

  const handleCopyIotKey = () => {
    const key = user?.organization_iot_api_key;
    if (!key) return;
    navigator.clipboard.writeText(key).then(() => {
      setIotKeyCopied(true);
      setTimeout(() => setIotKeyCopied(false), 2000);
    });
  };

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // AI preferences
  const [confidence, setConfidence] = useState(85);
  const [aiEnergy, setAiEnergy] = useState(true);
  const [aiWaste, setAiWaste] = useState(true);
  const [aiOps, setAiOps] = useState(true);

  // Notification preferences
  const [emailDigest, setEmailDigest] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [newInsights, setNewInsights] = useState(false);
  const [insightsFreq, setInsightsFreq] = useState('Instant');

  // Units & display
  const [currency, setCurrency] = useState('GBP (£)');
  const [energyUnit, setEnergyUnit] = useState('kWh (Kilowatt-hour)');
  const [weightUnit, setWeightUnit] = useState('Metric Tons (t)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Octopus Energy integration state
  const [octopusStatus, setOctopusStatus] = useState(null); // null = loading, {connected, mpan, ...}
  const [octopusApiKey, setOctopusApiKey] = useState('');
  const [octopusMpan, setOctopusMpan] = useState('');
  const [octopusSerial, setOctopusSerial] = useState('');
  const [octopusConnecting, setOctopusConnecting] = useState(false);
  const [octopusSyncing, setOctopusSyncing] = useState(false);
  const [showOctopusForm, setShowOctopusForm] = useState(false);
  const [showOctopusKey, setShowOctopusKey] = useState(false);

  // Populate from user context and saved preferences on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || (user.full_name || '').split(' ')[0] || '');
      setLastName(user.last_name || (user.full_name || '').split(' ').slice(1).join(' ') || '');
      setJobTitle(user.job_title || '');
      setDepartment(user.department || 'Operations');
      setCompanyName(user.company_name || '');
    }

    const prefs = loadPrefs();
    if (prefs.confidence !== undefined) setConfidence(prefs.confidence);
    if (prefs.aiEnergy !== undefined) setAiEnergy(prefs.aiEnergy);
    if (prefs.aiWaste !== undefined) setAiWaste(prefs.aiWaste);
    if (prefs.aiOps !== undefined) setAiOps(prefs.aiOps);
    if (prefs.emailDigest !== undefined) setEmailDigest(prefs.emailDigest);
    if (prefs.criticalAlerts !== undefined) setCriticalAlerts(prefs.criticalAlerts);
    if (prefs.newInsights !== undefined) setNewInsights(prefs.newInsights);
    if (prefs.insightsFreq) setInsightsFreq(prefs.insightsFreq);
    if (prefs.currency) setCurrency(prefs.currency);
    if (prefs.energyUnit) setEnergyUnit(prefs.energyUnit);
    if (prefs.weightUnit) setWeightUnit(prefs.weightUnit);
    if (prefs.dateFormat) setDateFormat(prefs.dateFormat);
  }, [user]);

  // Load Octopus connection status on mount
  useEffect(() => {
    octopusAPI.getStatus()
      .then(setOctopusStatus)
      .catch(() => setOctopusStatus({ connected: false }));
  }, []);

  const handleOctopusConnect = async (e) => {
    e.preventDefault();
    if (!octopusApiKey || !octopusMpan || !octopusSerial) {
      showToast('Please fill in all Octopus fields.', 'error');
      return;
    }
    setOctopusConnecting(true);
    try {
      await octopusAPI.connect({ api_key: octopusApiKey, mpan: octopusMpan, meter_serial: octopusSerial });
      const status = await octopusAPI.getStatus();
      setOctopusStatus(status);
      setShowOctopusForm(false);
      setOctopusApiKey('');
      showToast('Octopus Energy connected successfully.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Connection failed. Check your credentials.', 'error');
    } finally {
      setOctopusConnecting(false);
    }
  };

  const handleOctopusSync = async () => {
    setOctopusSyncing(true);
    try {
      const result = await octopusAPI.sync();
      const status = await octopusAPI.getStatus();
      setOctopusStatus(status);
      showToast(`Synced ${result.imported} reading${result.imported !== 1 ? 's' : ''} from Octopus Energy.`, 'success');
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Sync failed. Please try again.', 'error');
    } finally {
      setOctopusSyncing(false);
    }
  };

  const handleOctopusDisconnect = async () => {
    if (!window.confirm('Disconnect Octopus Energy? Your existing data will be kept.')) return;
    try {
      await octopusAPI.disconnect();
      setOctopusStatus({ connected: false });
      showToast('Octopus Energy disconnected.', 'success');
    } catch {
      showToast('Failed to disconnect. Please try again.', 'error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const full_name = [firstName, lastName].filter(Boolean).join(' ');
      const updated = await authAPI.updateProfile({ full_name, job_title: jobTitle, department, company_name: companyName });
      const newUser = { ...user, ...updated, full_name };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);

      localStorage.setItem(PREFS_KEY, JSON.stringify({
        confidence, aiEnergy, aiWaste, aiOps,
        emailDigest, criticalAlerts, newInsights, insightsFreq,
        currency, energyUnit, weightUnit, dateFormat,
      }));

      showToast('Settings saved successfully', 'success');
    } catch {
      // Profile update failed — still save local preferences
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        confidence, aiEnergy, aiWaste, aiOps,
        emailDigest, criticalAlerts, newInsights, insightsFreq,
        currency, energyUnit, weightUnit, dateFormat,
      }));
      showToast('Preferences saved. Profile update failed. Please try again.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.first_name || (user.full_name || '').split(' ')[0] || '');
      setLastName(user.last_name || (user.full_name || '').split(' ').slice(1).join(' ') || '');
      setJobTitle(user.job_title || '');
      setDepartment(user.department || 'Operations');
      setCompanyName(user.company_name || '');
    }
    const prefs = loadPrefs();
    if (prefs.confidence !== undefined) setConfidence(prefs.confidence);
    showToast('Changes discarded', 'info');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await authAPI.updateProfile({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Password change failed';
      showToast(msg, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // User initials for avatar
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">GreenPulse Corp</h2>
                  <p className="text-xs text-gray-500">Enterprise Plan</p>
                </div>
                <i className="fa-solid fa-chevron-down text-xs text-gray-400 ml-auto cursor-pointer"></i>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Workspace</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => showToast('General settings coming soon', 'info')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                  >
                    <i className="fa-regular fa-building w-4 text-center group-hover:text-emerald-500 transition-colors"></i> General
                  </button>
                  {hasRole('MANAGER', 'ADMIN') && (
                    <button
                      onClick={() => navigate('/team')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                    >
                      <i className="fa-solid fa-users w-4 text-center group-hover:text-emerald-500 transition-colors"></i> Team Members
                    </button>
                  )}
                  {hasRole('MANAGER', 'ADMIN') && (
                    <button
                      onClick={() => navigate('/import')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                    >
                      <i className="fa-solid fa-file-import w-4 text-center group-hover:text-emerald-500 transition-colors"></i> Data Import
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/iot-feed')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                  >
                    <i className="fa-solid fa-tower-broadcast w-4 text-center group-hover:text-emerald-500 transition-colors"></i> IoT Live Feed
                  </button>
                  <button
                    onClick={() => navigate('/glossary')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                  >
                    <i className="fa-solid fa-book-open w-4 text-center group-hover:text-emerald-500 transition-colors"></i> Glossary
                  </button>
                  <button
                    onClick={() => showToast('Billing settings coming soon', 'info')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group text-left"
                  >
                    <i className="fa-regular fa-credit-card w-4 text-center group-hover:text-emerald-500 transition-colors"></i> Billing
                  </button>
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">My Account</h3>
                <nav className="space-y-1">
                  {[
                    { href: '#section-profile',       icon: 'fa-regular fa-user',              label: 'Profile' },
                    { href: '#section-password',      icon: 'fa-solid fa-lock',                label: 'Change Password' },
                    { href: '#section-notifications', icon: 'fa-regular fa-bell',              label: 'Notifications' },
                    { href: '#section-units',         icon: 'fa-solid fa-globe',               label: 'Units & Currency' },
                    { href: '#section-ai',            icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI Preferences' },
                    { href: '#section-data',          icon: 'fa-solid fa-plug',                label: 'Data Connections' },
                  ].map(({ href, icon, label }) => (
                    <a key={href} href={href} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group">
                      <i className={`${icon} w-4 text-center group-hover:text-emerald-500 transition-colors`}></i> {label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 w-full transition-colors">
                <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Sign Out
              </button>
            </div>

            <div className="mt-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-lg flex-shrink-0">
                  👋
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Need help?</h4>
                  <p className="text-xs text-gray-500 mb-3">Our support team is available 24/7 to assist you.</p>
                  <Link to="/contact" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Contact Support →</Link>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="mb-6">
            <span className="text-xs font-medium text-gray-400 mb-1 block">My Account</span>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <div id="section-profile" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal details here.</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-md select-none">
                      {initials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-500">{user?.role?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-900">{firstName} {lastName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role} · {user?.department || 'No department'}</p>
                    <p className="text-xs text-gray-400 mt-1">Avatar shows your initials and role badge.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                        disabled
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <i className="fa-solid fa-lock text-gray-400 text-xs" title="Contact admin to change email"></i>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">This email is managed by your organisation.</p>
                  </div>
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Company / Organisation Name
                      <span className="ml-1 text-xs text-emerald-600 font-normal">(used on PDF reports)</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                      placeholder="e.g. The Oak Street Bistro Ltd"
                    />
                  </div>
                  {user?.organization_iot_api_key && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IoT API Key
                        <span className="ml-1 text-xs text-gray-400 font-normal">(use this as the X-API-Key header for your IoT devices)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-gray-700 truncate select-all">
                          {user.organization_iot_api_key}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyIotKey}
                          className="shrink-0 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-1.5"
                        >
                          <i className={`fa-solid ${iotKeyCopied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                          {iotKeyCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Keep this key secret. Regenerate it from the admin panel if compromised.</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      id="role"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                      placeholder="e.g. Sustainability Manager"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                    >
                      <option>Operations</option>
                      <option>Sustainability</option>
                      <option>Facilities</option>
                      <option>Finance</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div id="section-password" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">Update your account password.</p>
              </div>
              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 ${
                          confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i className={`fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2.5 bg-gray-800 border border-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-900 shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPassword ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Updating...</>
                    ) : (
                      <><i className="fa-solid fa-key"></i> Update Password</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
                <p className="text-sm text-gray-500 mt-1">Choose your preferred interface theme. Saved locally on this device.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                      <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dark ? 'Dark mode' : 'Light mode'}</p>
                      <p className="text-xs text-gray-500">{dark ? 'Easy on the eyes in low light' : 'Default bright theme'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${dark ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={dark}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* AI Insights Preferences */}
            <div id="section-ai" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Insights Preferences</h3>
                  <p className="text-sm text-gray-500 mt-1">Customize how AI recommendations are generated and displayed. <span className="text-gray-400">(Saved locally on this device)</span></p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <i className="fa-solid fa-wand-magic-sparkles"></i> AI Active
                </span>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium text-gray-900">Confidence Threshold</label>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{confidence}%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                      <div style={{ width: `${((confidence - 50) / 49) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all"></div>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full h-2 bg-transparent appearance-none cursor-pointer absolute top-1 z-10"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>50% (More insights)</span>
                      <span>99% (Higher accuracy)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Only show insights where the AI confidence score meets or exceeds this threshold.</p>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Enabled Insight Categories</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Energy Efficiency', desc: 'HVAC, lighting, and power usage optimisation', icon: 'fa-bolt', color: 'emerald', checked: aiEnergy, set: setAiEnergy },
                      { label: 'Waste Reduction', desc: 'Recycling streams and waste diversion', icon: 'fa-recycle', color: 'blue', checked: aiWaste, set: setAiWaste },
                      { label: 'Operational Maintenance', desc: 'Preventive alerts and equipment health', icon: 'fa-gears', color: 'gray', checked: aiOps, set: setAiOps },
                    ].map(({ label, desc, icon, color, checked, set }) => (
                      <div key={label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded bg-${color}-100 flex items-center justify-center text-${color}-600`}>
                            <i className={`fa-solid ${icon} text-xs`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{label}</p>
                            <p className="text-xs text-gray-500">{desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div id="section-notifications" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500 mt-1">Manage how you receive updates and alerts. <span className="text-gray-400">(Saved locally on this device)</span></p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Digest</h4>
                    <p className="text-xs text-gray-500 mt-1">Receive a weekly summary of your savings and impact.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Critical Alerts</h4>
                    <p className="text-xs text-gray-500 mt-1">Immediate notifications for equipment failures or spikes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={criticalAlerts} onChange={(e) => setCriticalAlerts(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">New Insights</h4>
                    <p className="text-xs text-gray-500 mt-1">Get notified when AI generates high-confidence recommendations.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={insightsFreq}
                      onChange={(e) => setInsightsFreq(e.target.value)}
                      className="text-xs border-gray-300 border rounded py-1 px-2 text-gray-600 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      <option>Instant</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={newInsights} onChange={(e) => setNewInsights(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Units & Display */}
            <div id="section-units" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Units & Display</h3>
                <p className="text-sm text-gray-500 mt-1">Set your preferred measurement units and currency.</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Currency', value: currency, set: setCurrency, options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)'] },
                  { label: 'Energy Unit', value: energyUnit, set: setEnergyUnit, options: ['kWh (Kilowatt-hour)', 'MWh (Megawatt-hour)', 'BTU (British Thermal Unit)'] },
                  { label: 'Weight Unit (Waste)', value: weightUnit, set: setWeightUnit, options: ['Metric Tons (t)', 'Kilograms (kg)', 'Pounds (lbs)', 'Short Tons'] },
                  { label: 'Date Format', value: dateFormat, set: setDateFormat, options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                ].map(({ label, value, set, options }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="relative">
                      <select
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 appearance-none"
                      >
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Connections */}
            <div id="section-data" className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Data Connections</h3>
                <p className="text-sm text-gray-500 mt-1">Connect your energy provider for automatic data import.</p>
              </div>

              {/* Octopus Energy card */}
              <div className="p-6">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f15a2b] flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-bolt text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Octopus Energy</p>
                        <p className="text-xs text-gray-500">Half-hourly electricity import · Core plan</p>
                      </div>
                    </div>
                    {octopusStatus === null ? (
                      <span className="text-xs text-gray-400"><i className="fa-solid fa-circle-notch fa-spin mr-1"></i>Loading…</span>
                    ) : octopusStatus.connected ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Connected
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">Not connected</span>
                    )}
                  </div>

                  {/* Connected state */}
                  {octopusStatus?.connected && (
                    <div className="px-5 py-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 mb-0.5">MPAN</p>
                          <p className="font-mono font-medium text-gray-700">{octopusStatus.mpan || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Meter Serial</p>
                          <p className="font-mono font-medium text-gray-700">{octopusStatus.meter_serial || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-400 mb-0.5">Last synced</p>
                          <p className="font-medium text-gray-700">
                            {octopusStatus.last_sync
                              ? new Date(octopusStatus.last_sync).toLocaleString('en-GB')
                              : 'Never — click Sync Now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleOctopusSync}
                          disabled={octopusSyncing}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                        >
                          <i className={`fa-solid fa-rotate${octopusSyncing ? ' fa-spin' : ''} text-xs`}></i>
                          {octopusSyncing ? 'Syncing…' : 'Sync Now'}
                        </button>
                        <button
                          onClick={handleOctopusDisconnect}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-link-slash text-xs"></i>
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Not connected — show connect button or form */}
                  {octopusStatus !== null && !octopusStatus.connected && (
                    <div className="px-5 py-4">
                      {!showOctopusForm ? (
                        <button
                          onClick={() => setShowOctopusForm(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <i className="fa-solid fa-plug text-xs"></i>
                          Connect Octopus Energy
                        </button>
                      ) : (
                        <form onSubmit={handleOctopusConnect} className="space-y-3">
                          <p className="text-xs text-gray-500 mb-3">
                            Find your API key in your{' '}
                            <a href="https://octopus.energy/dashboard/developer/" target="_blank" rel="noreferrer" className="text-emerald-600 underline">Octopus account dashboard</a>.
                            Your MPAN and meter serial are on your bill or in the same developer section.
                          </p>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">API Key</label>
                            <div className="relative">
                              <input
                                type={showOctopusKey ? 'text' : 'password'}
                                value={octopusApiKey}
                                onChange={(e) => setOctopusApiKey(e.target.value)}
                                placeholder="sk_live_…"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 pr-10 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowOctopusKey(!showOctopusKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <i className={`fa-solid ${showOctopusKey ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">MPAN</label>
                              <input
                                type="text"
                                value={octopusMpan}
                                onChange={(e) => setOctopusMpan(e.target.value)}
                                placeholder="1012345678901"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Meter Serial</label>
                              <input
                                type="text"
                                value={octopusSerial}
                                onChange={(e) => setOctopusSerial(e.target.value)}
                                placeholder="19L1234567"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={octopusConnecting}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                            >
                              {octopusConnecting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin text-xs"></i> Connecting…</>
                              ) : (
                                <><i className="fa-solid fa-plug text-xs"></i> Connect</>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowOctopusForm(false)}
                              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* More providers coming soon */}
                <p className="text-xs text-gray-400 mt-4 text-center">
                  <i className="fa-solid fa-circle-info mr-1"></i>
                  More providers (n3rgy, EDF, British Gas) coming soon
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 pb-12">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-500 border border-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-600 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                ) : (
                  <><i className="fa-solid fa-check"></i> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-900">Help Center</Link>
            <Link to="/contact" className="hover:text-gray-900">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
