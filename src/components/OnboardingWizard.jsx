/**
 * OnboardingWizard
 * ─────────────────
 * Shown on first login (MANAGER / ADMIN only) when
 * localStorage.getItem('greenpulse_onboarded') is null.
 *
 * Steps:
 *   1 — Welcome
 *   2 — Add zone + send test reading
 *   3 — Success — "Go to dashboard"
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingestAPI } from '../services/api';

const ZONES = ['Zone A', 'Zone B', 'Production Floor', 'Office', 'Kitchen', 'Loading Bay'];

export default function OnboardingWizard({ user, onDismiss }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 2 form
  const [zone, setZone]   = useState('Zone A');
  const [customZone, setCustomZone] = useState('');
  const [kwh, setKwh]     = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  const handleSend = async () => {
    const zoneName = zone === '_custom' ? customZone.trim() : zone;
    if (!zoneName) { setSendError('Please enter a zone name.'); return; }
    const kwhVal = parseFloat(kwh);
    if (!kwh || isNaN(kwhVal) || kwhVal <= 0) { setSendError('Please enter a valid kWh value.'); return; }

    setSending(true);
    setSendError('');
    try {
      await ingestAPI.sendReading({
        consumption_kwh: kwhVal,
        zone: zoneName,
        facility_id: 1,
      });
      setStep(3);
    } catch (err) {
      setSendError(err.response?.data?.detail || 'Failed to send reading. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const finish = () => {
    localStorage.setItem('greenpulse_onboarded', '1');
    onDismiss();
  };

  const skip = () => {
    localStorage.setItem('greenpulse_onboarded', '1');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <i className="fa-solid fa-leaf text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to GreenPulse, {firstName}!
            </h2>
            <p className="text-gray-500 mb-8">
              Your workspace is ready. Let's send your first energy reading
              so your dashboard comes alive. It takes under a minute.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
              {[
                { icon: 'fa-bolt', label: 'Energy Monitor', desc: 'Live readings' },
                { icon: 'fa-recycle', label: 'Waste Tracking', desc: 'Diversion rates' },
                { icon: 'fa-wand-magic-sparkles', label: 'AI Insights', desc: 'Cost savings' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <i className={`fa-solid ${icon} text-emerald-500 text-lg mb-1 block`}></i>
                  <p className="font-semibold text-gray-800 text-xs">{label}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Let's get started <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button onClick={skip} className="flex-1 py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Add zone + reading */}
        {step === 2 && (
          <div className="p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Step 2 of 2</p>
              <h2 className="text-xl font-bold text-gray-900">Send your first reading</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter an energy reading for one of your zones. You can add more later via the Energy Monitor or by importing a CSV.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone</label>
                <select
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  <option value="_custom">Custom zone name…</option>
                </select>
                {zone === '_custom' && (
                  <input
                    type="text"
                    value={customZone}
                    onChange={e => setCustomZone(e.target.value)}
                    placeholder="e.g. Server Room"
                    className="mt-2 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Energy consumption (kWh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={kwh}
                    onChange={e => setKwh(e.target.value)}
                    placeholder="e.g. 320.5"
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">kWh</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Tip: Check your smart meter or energy bill for a typical hourly reading.
                </p>
              </div>

              {sendError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {sendError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {sending
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Sending…</>
                  : <><i className="fa-solid fa-paper-plane"></i> Send reading</>}
              </button>
              <button onClick={skip} className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-circle-check text-emerald-500 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your dashboard is live!</h2>
            <p className="text-gray-500 mb-8">
              Your first reading has been logged. Head to the Energy Monitor to see it on the chart,
              or add more zones to get the full picture.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: 'fa-chart-line', label: 'View energy trends', path: '/energy' },
                { icon: 'fa-file-import', label: 'Import bulk CSV data', path: '/import' },
                { icon: 'fa-users', label: 'Invite your team', path: '/team' },
                { icon: 'fa-bullseye', label: 'Set sustainability goals', path: '/goals' },
              ].map(({ icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => { finish(); navigate(path); }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all text-sm"
                >
                  <i className={`fa-solid ${icon} text-emerald-500 w-5 text-center`}></i>
                  <span className="font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              Go to dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
