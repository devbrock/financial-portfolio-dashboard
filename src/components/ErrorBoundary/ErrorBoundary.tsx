import React from "react";
import { Button } from "@/components/Button";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * ErrorBoundary
 * Catches render/runtime errors in the React tree and shows a recovery UI.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
    // Keep logging simple; hook into a service here if needed.
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error", error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleContact = () => {
    window.location.href =
      "mailto:support@orionfcu.com?subject=Error%20in%20Orion%20Wealth%20Dashboard";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950/5 px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Something went wrong
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                We hit a snag loading this page.
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                Try reloading the page or contact us if the issue keeps
                happening.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={this.handleReload}>
                Reload page
              </Button>
              <Button variant="primary" onClick={this.handleContact}>
                Contact us
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
