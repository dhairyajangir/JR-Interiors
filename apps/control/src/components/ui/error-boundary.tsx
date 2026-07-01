"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Developer logging hook
    console.error("[ErrorBoundary] Uncaught react layout error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the active viewport path/window
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 border border-error-border rounded-md bg-error-bg/30 text-center max-w-lg mx-auto my-8 select-none animate-fade-in">
          {/* Danger Alert Icon */}
          <div className="p-3 rounded-full bg-error-bg border border-error-border text-error mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h2 className="text-sm font-semibold tracking-tight text-primary font-display">
            Something went wrong
          </h2>
          <p className="text-xs text-secondary leading-normal font-light max-w-sm mt-1 mb-5">
            An unexpected error occurred while rendering this interface. Please try refreshing or retrying the operation.
          </p>

          {/* Development Logs detail */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="w-full text-left text-[10px] font-mono text-error border border-error-border bg-error-bg/50 p-3 rounded-md mb-5 overflow-auto max-h-[140px] whitespace-pre-wrap select-text">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}

          {/* Retry Recovery Button */}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-1.5 border border-muted hover:border-bronze/45 hover:bg-panel hover:text-bronze text-secondary text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-bronze/50 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry Operation</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
