import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Production-grade React error boundary.
 * Catches render-phase errors, isolates the marketing site, and offers a
 * graceful, accessible recovery path instead of a blank white page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Enterprise: forward to your error monitoring (Sentry / Datadog RUM)
    console.error('[ErrorBoundary] Unhandled render error:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary" role="alert">
          <div className="error-boundary-card">
            <AlertTriangle size={40} className="text-accent" aria-hidden="true" />
            <h1>Something went wrong</h1>
            <p>
              An unexpected error interrupted the experience. Our team has been
              notified. Please try reloading the page.
            </p>
            <button type="button" className="btn btn-primary" onClick={this.handleReset}>
              Reload Experience
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}