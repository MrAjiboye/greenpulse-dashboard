import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">GreenPulse</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* Large 404 */}
          <p className="text-[120px] font-black text-emerald-500 leading-none select-none">404</p>

          <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Go back
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-md"
            >
              {user ? 'Go to Dashboard' : 'Go to Home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
