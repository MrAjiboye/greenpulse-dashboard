/**
 * OnboardingWizard — 4 steps
 *
 *  1  Welcome
 *  2  Get your data in  (CSV upload  |  manual reading  |  Octopus)
 *  3  Feature tour      (what each page does)
 *  4  You're ready      (quick-action links)
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingestAPI, importAPI } from '../services/api';

const TOTAL_STEPS = 4;

const ZONES = ['Zone A', 'Zone B', 'Production Floor', 'Office', 'Kitchen', 'Loading Bay'];

const FEATURES = [
  {
    icon: 'fa-bolt',
    color: 'bg-yellow-50 text-yellow-600',
    title: 'Energy Monitor',
    path: '/energy',
    desc: 'See your electricity usage hour by hour. Spot when you are wasting energy and track your costs in real time.',
  },
  {
    icon: 'fa-recycle',
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Waste Management',
    path: '/waste',
    desc: 'Log what goes to landfill vs what gets recycled. Track your diversion rate and get contamination alerts.',
  },
  {
    icon: 'fa-wand-magic-sparkles',
    color: 'bg-blue-50 text-blue-600',
    title: 'AI Insights',
    path: '/insights',
    desc: 'Ranked list of actions to cut costs and reduce emissions - generated automatically from your own data.',
  },
  {
    icon: 'fa-leaf',
    color: 'bg-green-50 text-green-600',
    title: 'Carbon Footprint',
    path: '/carbon',
    desc: 'Your total CO2 emissions from energy and waste. See your recycling offset and track year-on-year progress.',
  },
  {
    icon: 'fa-bullseye',
    color: 'bg-purple-50 text-purple-600',
    title: 'Goals',
    path: '/goals',
    desc: 'Set sustainability targets - e.g. cut energy by 10% this quarter. Progress bars update automatically.',
  },
  {
    icon: 'fa-file-lines',
    color: 'bg-orange-50 text-orange-600',
    title: 'Reports',
    path: '/reports',
    desc: 'Download monthly PDF reports for your records, auditors, or ESG disclosures. One click.',
  },
];

export default function OnboardingWizard({ user, onDismiss }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 2 state
  const [dataMethod, setDataMethod] = useState(null); // 'csv' | 'manual' | 'octopus'

  // Manual reading
  const [zone, setZone] = useState('Zone A');
  const [customZone, setCustomZone] = useState('');
  const [kwh, setKwh] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [csvType, setCsvType] = useState('energy'); // 'energy' | 'waste'
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const [csvError, setCsvError] = useState('');
  const fileInputRef = useRef(null);

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  const finish = () => {
    localStorage.setItem('greenpulse_onboarded', '1');
    onDismiss();
  };

  const skip = () => {
    localStorage.setItem('greenpulse_onboarded', '1');
    onDismiss();
  };

  // ── Step 2 handlers ──────────────────────────────────────────────────────

  const handleManualSend = async () => {
    const zoneName = zone === '_custom' ? customZone.trim() : zone;
    if (!zoneName) { setSendError('Please enter a zone name.'); return; }
    const kwhVal = parseFloat(kwh);
    if (!kwh || isNaN(kwhVal) || kwhVal <= 0) { setSendError('Please enter a valid kWh value.'); return; }
    setSending(true);
    setSendError('');
    try {
      await ingestAPI.sendReading({ consumption_kwh: kwhVal, zone: zoneName, facility_id: 1 });
      setStep(3);
    } catch (err) {
      setSendError(err.response?.data?.detail || 'Failed to send reading. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) { setCsvError('Please select a CSV file first.'); return; }
    setCsvUploading(true);
    setCsvError('');
    setCsvResult(null);
    try {
      const result = csvType === 'energy'
        ? await importAPI.energyCsv(csvFile)
        : await importAPI.wasteCsv(csvFile);
      setCsvResult(result);
    } catch (err) {
      setCsvError(err.response?.data?.detail || 'Upload failed. Check your file format and try again.');
    } finally {
      setCsvUploading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div
            className="h-1 bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="overflow-y-auto flex-1">

          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <i className="fa-solid fa-leaf text-white text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to GreenPulse, {firstName}!
              </h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Your workspace is ready. This quick setup takes under 2 minutes and will walk you through
                getting your first data in and show you what every page does.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
                {[
                  { icon: 'fa-bolt',                label: 'Energy Monitor',   desc: 'Live usage & costs' },
                  { icon: 'fa-recycle',             label: 'Waste Tracking',   desc: 'Diversion & alerts' },
                  { icon: 'fa-wand-magic-sparkles', label: 'AI Insights',      desc: 'Ranked cost savings' },
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

          {/* ── Step 2: Get your data in ── */}
          {step === 2 && (
            <div className="p-8">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Step 1 of 2</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Get your data in</h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose how you want to add your first data. You can always add more later.
              </p>

              {/* Method picker */}
              {!dataMethod && (
                <div className="space-y-3">
                  {[
                    {
                      key: 'csv',
                      icon: 'fa-file-csv',
                      title: 'Upload a CSV file',
                      desc: 'Have an energy or waste export from your meter or billing system? Upload it now.',
                      badge: 'Recommended',
                    },
                    {
                      key: 'manual',
                      icon: 'fa-pen-to-square',
                      title: 'Enter a reading manually',
                      desc: 'Type in a single energy reading to get your dashboard started right away.',
                      badge: null,
                    },
                    {
                      key: 'octopus',
                      icon: 'fa-plug',
                      title: 'Connect Octopus Energy',
                      desc: 'Automatically import your half-hourly meter data. Requires Core plan or above.',
                      badge: 'Core plan',
                    },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setDataMethod(m.key)}
                      className="w-full text-left flex items-start gap-4 p-4 border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${m.icon} text-gray-500 group-hover:text-emerald-600`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                          {m.badge && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{m.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-gray-300 group-hover:text-emerald-500 mt-1 text-xs flex-shrink-0"></i>
                    </button>
                  ))}
                  <button onClick={skip} className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors text-center mt-2">
                    Skip this step
                  </button>
                </div>
              )}

              {/* CSV upload form */}
              {dataMethod === 'csv' && (
                <div className="space-y-4">
                  <button onClick={() => { setDataMethod(null); setCsvFile(null); setCsvResult(null); setCsvError(''); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Back
                  </button>

                  <div className="flex gap-2">
                    {['energy', 'waste'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setCsvType(t)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                          csvType === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {t === 'energy' ? 'Energy CSV' : 'Waste CSV'}
                      </button>
                    ))}
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-gray-300 mb-2 block"></i>
                    {csvFile ? (
                      <p className="text-sm font-medium text-emerald-600">{csvFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-600">Click to browse or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">.csv files only</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { setCsvFile(e.target.files[0] || null); setCsvResult(null); setCsvError(''); }} />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">Required columns:</p>
                    {csvType === 'energy'
                      ? <p>timestamp, consumption_kwh, zone</p>
                      : <p>timestamp, stream, weight_kg, location</p>}
                  </div>

                  {csvError && <p className="text-xs text-red-500">{csvError}</p>}

                  {csvResult && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                      <p className="font-semibold text-emerald-700">
                        <i className="fa-solid fa-circle-check mr-1"></i>
                        {csvResult.imported} row{csvResult.imported !== 1 ? 's' : ''} imported
                        {csvResult.skipped > 0 && ` · ${csvResult.skipped} skipped`}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {csvResult ? (
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                      >
                        Next <i className="fa-solid fa-arrow-right ml-1"></i>
                      </button>
                    ) : (
                      <button
                        onClick={handleCsvUpload}
                        disabled={csvUploading || !csvFile}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {csvUploading
                          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Uploading…</>
                          : <><i className="fa-solid fa-cloud-arrow-up"></i> Upload CSV</>}
                      </button>
                    )}
                    <button onClick={() => setStep(3)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Manual reading form */}
              {dataMethod === 'manual' && (
                <div className="space-y-4">
                  <button onClick={() => { setDataMethod(null); setSendError(''); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Back
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone</label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    >
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                      <option value="_custom">Custom zone name…</option>
                    </select>
                    {zone === '_custom' && (
                      <input
                        type="text"
                        value={customZone}
                        onChange={(e) => setCustomZone(e.target.value)}
                        placeholder="e.g. Server Room"
                        className="mt-2 w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        onChange={(e) => setKwh(e.target.value)}
                        placeholder="e.g. 320.5"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">kWh</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Check your smart meter or energy bill for a typical hourly reading.</p>
                  </div>

                  {sendError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{sendError}</div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleManualSend}
                      disabled={sending}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {sending
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Sending…</>
                        : <><i className="fa-solid fa-paper-plane"></i> Send reading</>}
                    </button>
                    <button onClick={() => setStep(3)} className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Octopus redirect */}
              {dataMethod === 'octopus' && (
                <div className="space-y-4">
                  <button onClick={() => setDataMethod(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2">
                    <i className="fa-solid fa-arrow-left text-xs"></i> Back
                  </button>
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-xl bg-[#f15a2b] flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-bolt text-white text-xl"></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Connect Octopus Energy</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      You'll find the connection form in <strong>Settings → Data Connections</strong>.
                      You'll need your Octopus API key, MPAN, and meter serial number - all available in your Octopus account.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => { finish(); navigate('/settings'); }}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                      >
                        Go to Settings
                      </button>
                      <button onClick={() => setStep(3)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        Continue setup first
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Feature tour ── */}
          {step === 3 && (
            <div className="p-8">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Step 2 of 2</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">What's in your dashboard</h2>
              <p className="text-sm text-gray-500 mb-6">
                Six pages, each with a clear job. Click any to jump there now, or continue to finish setup.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {FEATURES.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => { finish(); navigate(f.path); }}
                    className="text-left flex gap-3 p-3.5 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className={`fa-solid ${f.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{f.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </button>
                <button onClick={skip} className="px-5 py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: All done ── */}
          {step === 4 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <i className="fa-solid fa-circle-check text-emerald-500 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Your free trial gives you 30 days of full access. Jump to any section below to get started,
                or go straight to your dashboard.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: 'fa-chart-line', label: 'View energy trends',      path: '/energy' },
                  { icon: 'fa-file-import', label: 'Import bulk CSV data',   path: '/import' },
                  { icon: 'fa-users',       label: 'Invite your team',       path: '/team' },
                  { icon: 'fa-bullseye',    label: 'Set sustainability goals', path: '/goals' },
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

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-1.5 py-4 flex-shrink-0 border-t border-gray-100">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i + 1 === step ? 'w-6 h-2 bg-emerald-500' : i + 1 < step ? 'w-2 h-2 bg-emerald-300' : 'w-2 h-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
