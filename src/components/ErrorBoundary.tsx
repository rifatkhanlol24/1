import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'An unexpected error occurred' };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  private handleClearStorage = () => {
    try {
      localStorage.removeItem('vc_users');
      localStorage.removeItem('vc_posts');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-white font-sans">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">একটি সমস্যা হয়েছে</h2>
              <p className="text-xs text-neutral-400 mt-1">
                অ্যাপ্লিকেশনের লোডিংয়ে সমস্যা হয়েছে। পৃষ্ঠাটি রিলোড করুন।
              </p>
              {this.state.errorMessage && (
                <p className="mt-2 text-[11px] font-mono text-rose-400/80 bg-neutral-950 p-2 rounded-xl border border-neutral-800 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ করুন</span>
              </button>
              <button
                onClick={this.handleClearStorage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>রিসেট ডাটা</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
