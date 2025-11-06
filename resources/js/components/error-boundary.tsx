import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Error capturado:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                        <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
                            ⚠️ Error en la aplicación
                        </h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            Lo sentimos, algo salió mal. Por favor, recarga la página.
                        </p>
                        {this.state.error && (
                            <details className="mb-4 rounded bg-gray-100 p-3 dark:bg-gray-700">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
                                    Detalles técnicos
                                </summary>
                                <pre className="mt-2 overflow-x-auto text-xs text-red-600 dark:text-red-400">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
