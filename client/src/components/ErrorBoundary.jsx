import React, { Component } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary Caught Error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/5 p-8 text-center backdrop-blur-sm my-6 mx-auto max-w-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-5">
            <AlertOctagon className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-sm">
            An unexpected error occurred while rendering the workspace cards or board state.
          </p>
          {this.state.error?.message && (
            <div className="mt-4 rounded-lg bg-gray-900/60 px-4 py-2 text-left font-mono text-xs text-red-300 max-w-full overflow-auto max-h-32 border border-gray-800">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="mt-6 flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-500 shadow-md shadow-red-500/15"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reload Workspace</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
