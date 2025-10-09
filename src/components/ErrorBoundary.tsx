import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-vintage-cream to-vintage-brown flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-vintage-dark-brown mb-4">
              Что-то пошло не так
            </h1>
            <p className="text-vintage-warm mb-6">
              Произошла ошибка при загрузке страницы. Это может быть связано с поврежденными данными в браузере.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-vintage-warm hover:bg-vintage-brown text-vintage-cream"
              >
                🔄 Очистить данные и перезагрузить
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full border-vintage-brown text-vintage-brown hover:bg-vintage-brown/10"
              >
                🏠 Вернуться на главную
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-vintage-warm/70 hover:text-vintage-warm">
                  Технические детали
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
