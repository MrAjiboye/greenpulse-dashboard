import { useState, useEffect, useCallback, useRef } from 'react';
import NavBar from '../components/NavBar';
import { Skeleton } from '../components/Skeleton';
import { energyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL = 30; // seconds

function timeAgo(isoStr) {
  if (!isoStr) return '—';
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function zoneColor(isoStr) {
  if (!isoStr) return 'bg-gray-100 text-gray-500';
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 300)   return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  if (diff < 3600)  return 'bg-yellow-50 text-yellow-600 border-yellow-200';
  return 'bg-gray-50 text-gray-500 border-gray-200';
}

function zoneDot(isoStr) {
  if (!isoStr) return 'bg-gray-300';
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 300)  return 'bg-emerald-500 animate-pulse';
  if (diff < 3600) return 'bg-yellow-400';
  return 'bg-gray-400';
}

export default function IoTFeed() {
  const { user } = useAuth();
  const apiKey = user?.organization_iot_api_key;

  const [zones,   setZones]   = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [lastAt,  setLastAt]   = useState(null);   // Date of last fetch
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [copied,  setCopied]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [zonesRes, trendsRes] = await Promise.all([
        energyAPI.getZones(),
        energyAPI.getTrends(24),
      ]);
      setZones(zonesRes.zones ?? []);
      const all = trendsRes.trends ?? [];
      // Most recent 50 readings, newest first
      setReadings([...all].reverse().slice(0, 50));
      setLastAt(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch {
      // silently keep showing old data
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh timer
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchData(); return REFRESH_INTERVAL; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchData]);

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasData = zones.length > 0 || readings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IoT Live Feed</h1>
            <p className="text-gray-500 mt-1">Real-time energy readings from your connected devices</p>
          </div>
          <div className="flex items-center gap-3">
            {lastAt && (
              <span className="text-xs text-gray-400">
                Updated {timeAgo(lastAt)}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Refreshing in {countdown}s
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-8 w-28 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : !hasData ? (
          /* ── Empty state ── */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-tower-broadcast text-emerald-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No readings yet</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Once your IoT devices or scripts start sending readings, they'll appear here in real time.
                Use your API key below to connect your first device.
              </p>
              <a
                href="/docs/iot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                <i className="fa-solid fa-book"></i>
                View IoT Setup Docs
              </a>
            </div>

            {apiKey && <ApiKeyCard apiKey={apiKey} copied={copied} onCopy={handleCopyKey} />}
          </div>
        ) : (
          <div className="space-y-6">

            {/* Zone cards */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Zone Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {zones.map(z => (
                  <div key={z.zone} className={`bg-white rounded-2xl border p-5 ${zoneColor(z.timestamp)}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${zoneDot(z.timestamp)}`}></span>
                      <span className="text-sm font-medium truncate">{z.zone}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{z.consumption_kwh} <span className="text-sm font-normal text-gray-400">kWh</span></p>
                    <p className="text-xs mt-1 text-gray-400">{timeAgo(z.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Readings table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">Recent Readings</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Last 24 hours · {readings.length} readings</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>

              {readings.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No readings in the last 24 hours</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-6 py-3 text-left">Timestamp</th>
                        <th className="px-6 py-3 text-left">Zone</th>
                        <th className="px-6 py-3 text-right">kWh</th>
                        <th className="px-6 py-3 text-right">Est. Cost</th>
                        <th className="px-6 py-3 text-right">Age</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {readings.map((r, i) => {
                        const cost = (r.consumption_kwh * 0.28).toFixed(2);
                        const isRecent = i === 0;
                        return (
                          <tr key={i} className={`hover:bg-gray-50 transition-colors ${isRecent ? 'bg-emerald-50/40' : ''}`}>
                            <td className="px-6 py-3 font-mono text-xs text-gray-600">
                              {new Date(r.timestamp).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <i className="fa-solid fa-location-dot text-xs"></i>
                                {r.zone}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">{r.consumption_kwh}</td>
                            <td className="px-6 py-3 text-right text-gray-500">£{cost}</td>
                            <td className="px-6 py-3 text-right text-xs text-gray-400">{timeAgo(r.timestamp)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* API Key card */}
            {apiKey && <ApiKeyCard apiKey={apiKey} copied={copied} onCopy={handleCopyKey} />}

          </div>
        )}
      </div>
    </div>
  );
}

function ApiKeyCard({ apiKey, copied, onCopy }) {
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'https://your-backend.railway.app';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-key text-amber-500"></i>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">IoT API Key</h2>
          <p className="text-xs text-gray-500 mt-0.5">Use this key to authenticate your devices and scripts</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 mb-4">
        <code className="flex-1 text-sm font-mono text-gray-700 truncate">{apiKey}</code>
        <button
          onClick={onCopy}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="rounded-xl bg-gray-900 text-gray-100 p-4 text-xs font-mono overflow-x-auto">
        <p className="text-gray-400 mb-2"># Send a reading via cURL:</p>
        <p className="text-emerald-400">curl -X POST \</p>
        <p className="pl-4 text-white">  {backendUrl}/api/v1/ingest/webhook/my-device \</p>
        <p className="pl-4 text-yellow-300">  -H "X-API-Key: {apiKey}" \</p>
        <p className="pl-4 text-white">  -H "Content-Type: application/json" \</p>
        <p className="pl-4 text-blue-300">  -d '{`{"consumption_kwh": 1.23, "zone": "Zone A"}`}'</p>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Keep this key secret. Rotate it in Settings if compromised.
        See the <a href="/docs/iot" target="_blank" className="text-emerald-600 hover:underline">IoT documentation</a> for full integration guides.
      </p>
    </div>
  );
}
