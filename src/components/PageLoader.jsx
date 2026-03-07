/**
 * PageLoader
 * Full-screen branded loading screen with ripple rings and animated leaf.
 * Used for auth-gate loading and initial page loads.
 */
export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Ripple rings + leaf icon */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        {/* Three expanding ripple rings */}
        <span className="ripple-ring" />
        <span className="ripple-ring" />
        <span className="ripple-ring" />

        {/* Core circle */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-white"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-14 9 1-3 3-6 9-8z" />
          </svg>
        </div>
      </div>

      {/* Brand name */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
        Green<span className="text-emerald-500">Pulse</span>
      </h1>

      {/* Message */}
      <p className="text-sm text-gray-400 mb-6">{message}</p>

      {/* Bouncing dots */}
      <div className="flex items-center gap-2">
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>
    </div>
  );
}
