import { useState, useRef } from 'react';
import NavBar from '../components/NavBar';
import { importAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'energy', label: 'Energy CSV', icon: 'fa-solid fa-bolt' },
  { id: 'waste',  label: 'Waste CSV',  icon: 'fa-solid fa-trash' },
];

const ENERGY_COLUMNS = [
  { name: 'timestamp',       req: true,  note: 'ISO 8601 or readable date e.g. 2026-03-01 09:00:00' },
  { name: 'consumption_kwh', req: true,  note: 'Decimal number' },
  { name: 'zone',            req: true,  note: 'e.g. Zone A, Production Floor' },
  { name: 'facility_id',     req: false, note: 'Integer, defaults to 1' },
];

const WASTE_COLUMNS = [
  { name: 'timestamp',             req: true,  note: 'ISO 8601 or readable date' },
  { name: 'stream',                req: true,  note: 'e.g. recycling, compost, general' },
  { name: 'weight_kg',             req: true,  note: 'Decimal number' },
  { name: 'location',              req: true,  note: 'e.g. Loading Bay, Canteen' },
  { name: 'contamination_detected',req: false, note: 'true/false, defaults to false' },
];

const ENERGY_SAMPLE = `timestamp,consumption_kwh,zone,facility_id
2026-03-01 00:00:00,320.5,Zone A,1
2026-03-01 01:00:00,285.2,Zone A,1
2026-03-01 00:00:00,410.0,Production Floor,1`;

const WASTE_SAMPLE = `timestamp,stream,weight_kg,location,contamination_detected
2026-03-01 08:00:00,recycling,145.5,Loading Bay,false
2026-03-01 08:00:00,general,210.0,Canteen,false
2026-03-01 08:00:00,compost,88.3,Kitchen,false`;

function downloadSample(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function DataImport() {
  const { showToast } = useToast();
  const [tab, setTab]         = useState('energy');
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]   = useState(null);
  const inputRef = useRef();

  const columns = tab === 'energy' ? ENERGY_COLUMNS : WASTE_COLUMNS;
  const sample  = tab === 'energy' ? ENERGY_SAMPLE  : WASTE_SAMPLE;

  const handleFile = (f) => {
    if (!f?.name?.endsWith('.csv')) {
      showToast('Please select a .csv file', 'error');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const data = tab === 'energy'
        ? await importAPI.energyCsv(file)
        : await importAPI.wasteCsv(file);
      setResult(data);
      if (data.imported > 0) showToast(`${data.imported} rows imported successfully`, 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Check your CSV format.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
          <p className="text-gray-500 mt-1">Upload CSV files to bulk-import energy or waste readings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <i className={t.icon}></i> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Upload zone */}
          <div className="lg:col-span-3 space-y-4">

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-10 ${
                dragging
                  ? 'border-emerald-400 bg-emerald-50'
                  : file
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <i className="fa-solid fa-file-csv text-emerald-600 text-xl"></i>
                  </div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <i className="fa-solid fa-cloud-arrow-up text-gray-500 text-xl"></i>
                  </div>
                  <p className="font-medium text-gray-700">Drag & drop your CSV here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </>
              )}
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Importing…</>
                : <><i className="fa-solid fa-upload"></i> Import CSV</>}
            </button>

            {/* Results */}
            {result && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                <h3 className="font-semibold text-gray-800">Import Results</h3>
                <div className="flex gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                    <i className="fa-solid fa-circle-check"></i> {result.imported} imported
                  </span>
                  {result.skipped > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium">
                      <i className="fa-solid fa-triangle-exclamation"></i> {result.skipped} skipped
                    </span>
                  )}
                </div>
                {result.errors?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Row errors</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {result.errors.map((e, i) => (
                        <div key={i} className="flex gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                          <span className="font-medium">Row {e.row}:</span> {e.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Format guide */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Required Format</h3>
              <div className="space-y-2.5">
                {columns.map(col => (
                  <div key={col.name}>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{col.name}</code>
                      {col.req
                        ? <span className="text-xs text-red-500 font-medium">required</span>
                        : <span className="text-xs text-gray-400">optional</span>}
                    </div>
                    <p className="text-xs text-gray-400 ml-1 mt-0.5">{col.note}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => downloadSample(sample, `sample_${tab}.csv`)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                <i className="fa-solid fa-download"></i> Download sample CSV
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex gap-2">
                <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Tips</p>
                  <ul className="space-y-1 text-xs text-blue-600">
                    <li>• Max 1,000 rows per upload</li>
                    <li>• Timestamps in UTC are recommended</li>
                    <li>• Duplicate rows are imported as-is</li>
                    <li>• Headers must match exactly (case-insensitive)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

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
