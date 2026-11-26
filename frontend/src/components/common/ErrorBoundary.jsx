// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

function isChunkLoadError(error) {
  const msg = String(error?.message || error || '');
  return (
    error?.name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg)
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { variant = 'fullscreen', onReturnHome } = this.props;
    const chunkFailure = isChunkLoadError(this.state.error);
    const errorMessage = this.state.error?.message || 'An unexpected rendering issue occurred.';

    if (variant === 'silent') {
      return null;
    }

    if (variant === 'inline') {
      return (
        <div className="p-6 sm:p-8 rounded-3xl bg-salon-card border border-red-200 shadow-xs text-center space-y-4 my-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-editorial text-xl text-salon-dark">
              {chunkFailure ? 'New Update Available' : 'Unable to Render This Section'}
            </h3>
            <p className="text-xs text-salon-muted leading-relaxed">
              {chunkFailure
                ? 'A newer version of this module was deployed. Reload to load the latest bundle.'
                : errorMessage}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={chunkFailure ? () => window.location.reload() : this.handleRetry}
              className="px-5 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{chunkFailure ? 'Reload Page' : 'Try Again'}</span>
            </button>
            {onReturnHome && (
              <button
                type="button"
                onClick={onReturnHome}
                className="px-4 py-2 rounded-full border border-salon-border text-xs font-semibold text-salon-dark hover:bg-salon-soft inline-flex items-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FFFDF8] border border-[#1A1614]/15 p-8 shadow-[10px_10px_0px_rgba(180,86,62,0.16)] text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#933E29] font-semibold block">
              RiTiVerse Atelier Recovery
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-light text-[#1A1614]">
              {chunkFailure ? 'Studio Update Ready' : 'Something Went Wrong'}
            </h1>
            <p className="text-xs sm:text-sm text-[#665B54] leading-relaxed">
              {chunkFailure
                ? 'A newer version of RiTiVerse Salon was published. Please reload your browser to continue.'
                : errorMessage}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (onReturnHome) {
                  onReturnHome();
                } else {
                  window.location.href = '/';
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#1A1614]/20 hover:border-[#B4563E] text-[#1A1614] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
