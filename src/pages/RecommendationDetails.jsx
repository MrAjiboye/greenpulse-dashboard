import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import NavBar from '../components/NavBar';
import { insightsAPI } from '../services/api';

const RecommendationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsAPI.getById(id)
      .then(setInsight)
      .catch(() => showToast('Failed to load recommendation', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const categoryColor = {
    energy: 'bg-blue-100 text-blue-700',
    waste: 'bg-green-100 text-green-700',
    operations: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => navigate('/insights')} className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i> Back to AI Insights
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Recommendation Details</h1>
          <p className="text-gray-500 mt-1">Detailed analysis and implementation guide</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${categoryColor[insight?.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {insight?.category ?? 'General'}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-3">{insight?.title ?? '—'}</h2>
                    <p className="text-gray-500 mt-2">{insight?.description ?? ''}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm text-gray-500">Potential Savings</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      £{insight?.estimated_savings != null ? insight.estimated_savings.toFixed(0) : '—'}/mo
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Problem Identified</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our AI has analysed your operational data and identified a recurring inefficiency in this area.
                      The pattern suggests there is consistent room for improvement that, once addressed, will reduce
                      your energy consumption and associated costs.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Recommended Action</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {insight?.description ?? 'Review and apply the recommended changes outlined below.'}
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                        <span className="text-gray-600">Reduce unnecessary energy usage in this category</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                        <span className="text-gray-600">Estimated monthly saving of £{insight?.estimated_savings?.toFixed(0) ?? '—'}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                        <span className="text-gray-600">Estimated annual saving of £{insight?.estimated_savings != null ? (insight.estimated_savings * 12).toFixed(0) : '—'}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Implementation Steps</h3>
                    <div className="space-y-3">
                      {['Review current configuration', 'Apply the recommended changes', 'Monitor results for 2 weeks'].map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">{i + 1}</div>
                          <div>
                            <p className="font-medium text-gray-900">{step}</p>
                            <p className="text-sm text-gray-600">Follow the standard procedure for this recommendation</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{insight?.category ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{insight?.status ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly Savings</p>
                    <p className="text-lg font-bold text-emerald-600">£{insight?.estimated_savings?.toFixed(0) ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Annual Savings</p>
                    <p className="text-lg font-bold text-emerald-600">
                      £{insight?.estimated_savings != null ? (insight.estimated_savings * 12).toFixed(0) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <i className="fa-solid fa-lightbulb text-blue-600 text-xl"></i>
                  <div>
                    <h3 className="font-bold text-gray-900">Need Help?</h3>
                    <p className="text-sm text-gray-600 mt-1">Our team can implement this for you remotely.</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Request Assistance
                </button>
              </div>

              {insight?.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => navigate(`/apply-recommendation/${id}`)}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg">
                  Apply This Recommendation
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecommendationDetails;
