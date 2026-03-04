import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-2">
            An unexpected error occurred. Your data is safe — this is just a display issue.
          </p>

          {/* Collapsible error detail */}
          {this.state.error && (
            <details className="text-left bg-gray-100 rounded-lg px-4 py-3 mb-6 cursor-pointer">
              <summary className="text-xs font-medium text-gray-500 select-none">Technical details</summary>
              <p className="text-xs text-red-600 font-mono mt-2 break-all whitespace-pre-wrap">
                {this.state.error.message}
              </p>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-md"
            >
              Try again
            </button>
            <button
              onClick={() => { this.handleReset(); window.location.href = '/dashboard'; }}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 mt-10 text-gray-400">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-leaf" style={{ fontSize: '10px' }}></i>
            </div>
            <span className="text-sm font-semibold">GreenPulse</span>
          </div>
        </div>
      </div>
    );
  }
}
