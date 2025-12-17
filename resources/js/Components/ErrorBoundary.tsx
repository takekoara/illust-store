import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from '@inertiajs/react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // エラーをログに記録（本番環境ではエラートラッキングサービスに送信）
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            // カスタムフォールバックUIが提供されている場合はそれを使用
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // デフォルトのエラーUI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-indigo-600">500</h1>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                エラーが発生しました
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                申し訳ございません。予期しないエラーが発生しました。
                            </p>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <Link
                                href={route('dashboard')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                ダッシュボードに戻る
                            </Link>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                ページを再読み込み
                            </button>
                        </div>

                        {/* 開発環境ではエラー詳細を表示 */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
                                <h3 className="text-sm font-medium text-red-800 mb-2">
                                    エラー詳細（開発環境のみ）
                                </h3>
                                <pre className="text-xs text-red-700 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

