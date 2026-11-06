import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Something went wrong while rendering this page.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page render error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-white px-6 py-16 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900">Unable to display this page</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">{this.state.message}</p>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
            <Button onClick={this.handleReset}>Try again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
