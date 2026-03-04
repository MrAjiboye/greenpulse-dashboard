import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';
import { insightsAPI } from '../services/api';

const ApplyRecommendation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [applying, setApplying] = useState(false);
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    if (id) insightsAPI.getById(id).then(setInsight).catch(() => {});
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await insightsAPI.apply(id);
      setStep(3);
      showToast('Recommendation applied successfully!', 'success');
    } catch {
      showToast('Failed to apply recommendation. Please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  const monthlySavings = insight?.estimated_savings?.toFixed(0) ?? '—';
  const annualSavings = insight?.estimated_savings != null ? (insight.estimated_savings * 12).toFixed(0) : '—';

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-wand-magic-sparkles text-emerald-600 text-2xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply Recommendation</h1>
              <p className="text-gray-600">{insight?.title ?? 'Loading...'}{insight?.estimated_savings != null ? ` — Save £${monthlySavings}/month` : ''}</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-yellow-600 mt-1"></i>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Before You Continue</h3>
                    <p className="text-sm text-gray-700">
                      This action will mark this recommendation as applied and record it in your activity log.
                      You can review all applied recommendations in the Reports section.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recommendation Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900 capitalize">{insight?.category ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Savings</span>
                    <span className="font-bold text-emerald-600">£{monthlySavings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Savings</span>
                    <span className="font-bold text-emerald-600">£{annualSavings}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/insights')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Application</h1>
              <p className="text-gray-600">Review and confirm the changes</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <i className="fa-solid fa-check-circle text-emerald-600 text-2xl mt-1"></i>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Ready to Apply</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    GreenPulse will mark this recommendation as applied and log the action against your account.
                    The change will be reflected in your Reports immediately.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <input type="checkbox" id="confirm" className="rounded border-gray-300" required />
                    <label htmlFor="confirm" className="text-gray-700">
                      I confirm I have implemented this recommendation
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {applying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </>
                ) : (
                  'Apply Recommendation'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-check text-emerald-600 text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Successfully Applied!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your recommendation has been logged. You should start seeing energy savings reflected in your next report cycle.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Monthly Savings</span>
                  <span className="font-bold text-emerald-600">£{monthlySavings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Impact</span>
                  <span className="font-bold text-emerald-600">£{annualSavings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-bold text-gray-900 capitalize">{insight?.category ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/insights')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">
                View More Recommendations
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplyRecommendation;
