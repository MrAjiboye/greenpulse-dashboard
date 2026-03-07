import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { teamAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_LABELS = { ADMIN: 'Admin', MANAGER: 'Manager', VIEWER: 'Viewer' };
const ROLE_COLORS = {
  ADMIN:   'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  VIEWER:  'bg-gray-100 text-gray-600',
};

function Initials({ name, email }) {
  const text = name?.trim() || email || '?';
  const parts = text.split(' ').filter(Boolean);
  const letters = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : text.slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {letters}
    </div>
  );
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function daysSince(dateStr) {
  const diff = new Date() - new Date(dateStr);
  return Math.max(0, Math.floor(diff / 86400000));
}

export default function TeamMembers() {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isManager = hasRole('MANAGER', 'ADMIN');

  const [members, setMembers]   = useState([]);
  const [invites, setInvites]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('VIEWER');
  const [inviting, setInviting]       = useState(false);

  // Role editing
  const [editingRole, setEditingRole] = useState(null); // uid
  const [newRole, setNewRole]         = useState('');

  // Remove confirmation
  const [confirmRemove, setConfirmRemove] = useState(null); // uid

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mem, inv] = await Promise.all([
        teamAPI.getMembers(),
        isManager ? teamAPI.getInvites() : Promise.resolve([]),
      ]);
      setMembers(mem);
      setInvites(inv);
    } catch {
      showToast('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await teamAPI.invite({ email: inviteEmail.trim(), role: inviteRole });
      showToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to send invite', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (uid) => {
    try {
      await teamAPI.updateRole(uid, newRole);
      showToast('Role updated', 'success');
      setEditingRole(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update role', 'error');
    }
  };

  const handleRemove = async (uid) => {
    try {
      await teamAPI.removeMember(uid);
      showToast('Member removed', 'success');
      setConfirmRemove(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1">Manage who has access to your organisation's workspace</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Members table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  Members <span className="text-gray-400 font-normal ml-1">({members.length})</span>
                </h2>
              </div>

              {members.length === 0 ? (
                <div className="py-12 text-center text-gray-400">No members yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {members.map(m => (
                    <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                      <Initials name={m.full_name} email={m.email} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.full_name || m.email}
                          {m.id === user?.id && (
                            <span className="ml-2 text-xs text-gray-400">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{m.email}</p>
                      </div>

                      {/* Role */}
                      {editingRole === m.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          >
                            <option value="VIEWER">Viewer</option>
                            <option value="MANAGER">Manager</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(m.id)}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                          >Save</button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >Cancel</button>
                        </div>
                      ) : (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[m.role] || m.role}
                        </span>
                      )}

                      <p className="text-xs text-gray-400 hidden sm:block w-24 text-right">
                        Joined {daysSince(m.created_at)}d ago
                      </p>

                      {/* Actions (MANAGER only, not self) */}
                      {isManager && m.id !== user?.id && editingRole !== m.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingRole(m.id); setNewRole(m.role); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Change role"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          {confirmRemove === m.id ? (
                            <>
                              <button
                                onClick={() => handleRemove(m.id)}
                                className="text-xs font-medium text-red-600 hover:text-red-700 px-2"
                              >Confirm</button>
                              <button
                                onClick={() => setConfirmRemove(null)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >Cancel</button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmRemove(m.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove member"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invite form */}
            {isManager && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Invite a team member</h2>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {inviting
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      : <i className="fa-solid fa-paper-plane"></i>}
                    {inviting ? 'Sending…' : 'Send invite'}
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-2">
                  Viewers can view data. Managers can add readings, import data, and invite others.
                </p>
              </div>
            )}

            {/* Pending invites */}
            {isManager && invites.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">
                    Pending invites <span className="text-gray-400 font-normal ml-1">({invites.length})</span>
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {invites.map(inv => (
                    <div key={inv.id} className="px-6 py-3.5 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-regular fa-envelope text-gray-400 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                        <p className="text-xs text-gray-400">
                          Sent {daysSince(inv.created_at)}d ago · expires in {daysUntil(inv.expires_at)}d
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[inv.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[inv.role] || inv.role}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 pt-8 mt-8 border-t border-gray-200">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <i className="fa-solid fa-leaf text-white text-xs"></i>
          </div>
          <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
          <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
        </div>
      </div>
    </div>
  );
}
