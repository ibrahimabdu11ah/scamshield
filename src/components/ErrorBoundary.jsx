// ---------------------------------------------------------------------------
// Catches unexpected errors so the person sees a clear message and a way out
// instead of a blank white page.
// ---------------------------------------------------------------------------

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('[ScamShield] render error', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="boot-screen" role="alert">
        <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Something went wrong</h1>
        <p>ScamShield hit an unexpected problem. Your messages were not sent anywhere.</p>
        <p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </p>
        <p className="fine-print">
          If it keeps happening, clear this site’s data in your browser settings and try again.
        </p>
      </div>
    );
  }
}
