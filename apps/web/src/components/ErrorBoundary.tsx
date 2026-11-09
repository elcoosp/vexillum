import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Route-level crash guard: a render error anywhere under the router shows a
 * recoverable panel instead of a blank page. The e2e suite treats a mounted
 * `[data-testid="app-crash"]` as a hard failure, so "no crash anywhere" is a
 * testable contract, not a hope.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // surfaced in dev tools; the UI stays recoverable
    console.error("vexillum: render error caught by boundary", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="mx-auto max-w-lg px-6 py-24 text-center"
          data-testid="app-crash"
          role="alert"
        >
          <h1 className="text-xl font-bold tracking-tight">Something broke on this page</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The view hit an unexpected error and was stopped before it could take the rest of the
            app down. Reload to retry — if it keeps happening, it's a bug worth reporting.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-left font-mono text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border border-border px-6 text-sm font-medium hover:bg-muted"
              onClick={() => this.setState({ error: null })}
            >
              Try rendering again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
