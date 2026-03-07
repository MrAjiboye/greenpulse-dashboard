import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

function CodeBlock({ code, language = 'bash' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <><i className="fa-solid fa-check mr-1"></i>Copied</> : <><i className="fa-solid fa-copy mr-1"></i>Copy</>}
      </button>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">{n}</div>
        <div className="flex-1 w-px bg-gray-200 mt-2"></div>
      </div>
      <div className="pb-10 flex-1 min-w-0">
        <h3 className="text-base font-bold text-gray-900 mb-3 mt-1">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function IoTDocs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const apiKey    = user?.organization_iot_api_key ?? 'YOUR_IOT_API_KEY';
  const orgName   = user?.organization_name ?? 'Your Organisation';
  const isAuthed  = !!user?.organization_iot_api_key;

  const endpoint  = `${BASE}/ingest/webhook/my-meter`;

  const curlExample = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "consumption_kwh": 42.5,
    "zone": "Zone A",
    "facility_id": 1
  }'`;

  const pythonExample = `import requests

API_KEY = "${apiKey}"
ENDPOINT = "${endpoint}"

payload = {
    "consumption_kwh": 42.5,
    "zone": "Zone A",
    "facility_id": 1,
    # "timestamp": "2026-03-01T09:00:00Z"  # optional; defaults to now
}

response = requests.post(
    ENDPOINT,
    json=payload,
    headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
)
print(response.json())  # {"reading_id": 123, "status": "accepted"}`;

  const nodeExample = `const API_KEY = "${apiKey}";
const ENDPOINT = "${endpoint}";

const payload = {
  consumption_kwh: 42.5,
  zone: "Zone A",
  facility_id: 1,
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  },
  body: JSON.stringify(payload),
});
const data = await res.json();
console.log(data); // { reading_id: 123, status: "accepted" }`;

  const arduinoExample = `#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid       = "YOUR_WIFI_SSID";
const char* password   = "YOUR_WIFI_PASSWORD";
const char* apiKey     = "${apiKey}";
const char* serverUrl  = "${endpoint}";

void sendReading(float kwh, const char* zone) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", apiKey);

  String body = "{\\"consumption_kwh\\":" + String(kwh, 2) +
                ",\\"zone\\":\\"" + String(zone) + "\\"}";

  int code = http.POST(body);
  Serial.printf("Response: %d\\n", code);
  http.end();
}

void loop() {
  float reading = analogRead(A0) * 0.01; // replace with real sensor
  sendReading(reading, "Main Panel");
  delay(60000); // every 60 seconds
}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <span className="text-lg font-bold text-gray-900">GreenPulse</span>
            <span className="text-gray-300 ml-1">/</span>
            <span className="text-sm text-gray-500 ml-1">IoT Docs</span>
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/settings')} className="text-sm text-gray-500 hover:text-gray-900">
                ← Settings
              </button>
            ) : (
              <button onClick={() => navigate('/signin')} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                Sign in to see your API key →
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            IoT Integration Guide
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Connect Smart Meters & IoT Devices</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Push energy readings directly from smart meters, Raspberry Pi sensors, Arduino boards,
            or any device that can make HTTP requests — no JWT token required.
          </p>

          {/* API Key banner */}
          <div className={`mt-6 rounded-2xl border p-5 ${isAuthed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <i className={`fa-solid ${isAuthed ? 'fa-key text-emerald-600' : 'fa-circle-exclamation text-amber-500'} mt-0.5`}></i>
              <div>
                <p className={`text-sm font-semibold ${isAuthed ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {isAuthed ? `Your API key — ${orgName}` : 'Sign in to see your API key'}
                </p>
                {isAuthed ? (
                  <code className="mt-1 block text-xs font-mono text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg break-all">
                    {apiKey}
                  </code>
                ) : (
                  <p className="text-xs text-amber-700 mt-1">
                    Code examples below use a placeholder. <button onClick={() => navigate('/signin')} className="underline font-medium">Sign in</button> to auto-fill your real key.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: 'fa-microchip', title: 'Your device reads a meter', desc: 'Any sensor, smart meter, or data logger' },
              { icon: 'fa-arrow-right-arrow-left', title: 'POST to the webhook', desc: 'One HTTP request with your API key in the header' },
              { icon: 'fa-chart-line', title: 'Appears in dashboard', desc: 'Data flows into Energy Monitor instantly' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${icon} text-emerald-600`}></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-step */}
        <div>
          <Step n="1" title="Find your API key">
            <p className="text-sm text-gray-600 mb-3">
              Each organisation has a unique IoT API key. Managers can view it in{' '}
              <button onClick={() => navigate('/settings')} className="text-emerald-600 hover:underline font-medium">Settings → Data Connections</button>.
              Never share it publicly.
            </p>
            {isAuthed && (
              <CodeBlock code={`X-API-Key: ${apiKey}`} />
            )}
          </Step>

          <Step n="2" title="Send your first reading">
            <p className="text-sm text-gray-600 mb-3">
              POST to the webhook endpoint with a JSON body. The <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">device_id</code> path parameter is a label you choose — it's logged for reference.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-3 text-sm font-mono">
              <span className="text-emerald-600 font-bold">POST</span>{' '}
              <span className="text-gray-700">{BASE}/ingest/webhook/<span className="text-blue-600">{'{'+'device_id'+'}'}</span></span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Request body</p>
            <CodeBlock code={`{
  "consumption_kwh": 42.5,       // required — energy reading
  "zone": "Zone A",              // required — area name (e.g. "Main Meter", "Kitchen")
  "facility_id": 1,              // optional — defaults to 1
  "timestamp": "2026-03-01T09:00:00Z"  // optional — defaults to now (UTC)
}`} />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Success response</p>
            <CodeBlock code={`{ "reading_id": 123, "status": "accepted" }`} />
          </Step>

          <Step n="3" title="Code examples">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">cURL</p>
                <CodeBlock code={curlExample} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Python (requests)</p>
                <CodeBlock code={pythonExample} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Node.js (fetch)</p>
                <CodeBlock code={nodeExample} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Arduino / ESP32</p>
                <CodeBlock code={arduinoExample} />
              </div>
            </div>
          </Step>

          <Step n="4" title="Error reference">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meaning</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['201', 'Reading accepted', 'All good'],
                    ['401', 'Invalid API key', 'Check your X-API-Key header — copy from Settings'],
                    ['422', 'Validation error', 'Check required fields: consumption_kwh, zone'],
                    ['429', 'Rate limit exceeded', 'Max 120 requests/minute per org — add a delay'],
                  ].map(([code, meaning, fix]) => (
                    <tr key={code} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${code === '201' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{meaning}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>

          {/* Last step without connector line */}
          <div className="flex gap-5">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">5</div>
            </div>
            <div className="flex-1 min-w-0 mt-1">
              <h3 className="text-base font-bold text-gray-900 mb-3">Verify in the dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                After sending a reading, open the <strong>Energy Monitor</strong> page. New readings appear in the trend chart and zone status cards within seconds.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/energy')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-bolt"></i> Open Energy Monitor
                    </button>
                    <button
                      onClick={() => navigate('/import')}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-file-csv"></i> Import CSV instead
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Get started free →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-xs"></i>
            </div>
            <span className="text-sm font-semibold text-gray-700">GreenPulse</span>
            <span className="text-xs text-gray-400 ml-2">© 2026 GreenPulse Inc.</span>
          </div>
          <p className="text-xs text-gray-400">Questions? Contact support.</p>
        </div>
      </div>
    </div>
  );
}
