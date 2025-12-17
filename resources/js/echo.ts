import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

window.Pusher = Pusher;

// Pusher.jsのログレベルを設定（本番環境ではエラーを抑制）
if (import.meta.env.PROD) {
    // 本番環境では、Pusher.jsのログを抑制
    Pusher.logToConsole = false;
} else {
    // 開発環境では、ログを有効化
    Pusher.logToConsole = true;
}

// Reverbサーバーが起動していない場合でもエラーを表示しない
const reverbConfig: any = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'your-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    },
    // 接続失敗時のリトライ設定
    enabled: true,
    disableStats: true,
    // 本番環境では接続エラーを抑制
    cluster: undefined,
    // 接続タイムアウトを短く設定（本番環境でサーバーが起動していない場合の検出を早くする）
    activityTimeout: import.meta.env.PROD ? 30000 : 120000,
};

// 環境変数が設定されていない場合（本番環境でReverbが動作しない場合）は接続を無効化
const isReverbConfigured = import.meta.env.VITE_REVERB_APP_KEY && 
                            import.meta.env.VITE_REVERB_APP_KEY !== 'your-app-key';

if (isReverbConfigured) {
    try {
        window.Echo = new Echo<any>(reverbConfig);
        
        // 接続エラーを抑制（本番環境ではエラーを表示しない）
        if (window.Echo?.connector?.pusher?.connection) {
            // 接続エラーを抑制（本番環境ではコンソールに表示しない）
            window.Echo.connector.pusher.connection.bind('error', (error: any) => {
                // 開発環境でのみ警告を表示
                if (import.meta.env.DEV) {
                    if (error?.error?.data?.code === 1006 || error?.type === 'TransportError') {
                        console.warn('⚠️ Reverb server is not running. Real-time features will not work.');
                    } else {
                        console.error('❌ Echo connection error:', error);
                    }
                }
                // 本番環境ではエラーを表示しない（ユーザーに影響を与えない）
            });
            
            // 接続失敗時のエラーを抑制（本番環境）
            if (import.meta.env.PROD) {
                // 本番環境では、接続エラーを無視
                window.Echo.connector.pusher.connection.bind('state_change', (states: any) => {
                    // 接続状態の変更を監視（エラー時は何もしない）
                });
            }
            
            // デバッグ用: Echo接続状態をログに記録（開発環境のみ）
            if (import.meta.env.DEV) {
                window.Echo.connector.pusher.connection.bind('connected', () => {
                    console.log('✅ Echo connected to Reverb');
                });

                window.Echo.connector.pusher.connection.bind('disconnected', () => {
                    console.log('❌ Echo disconnected from Reverb');
                });
            }
        }
    } catch (error) {
        // Echoオブジェクトの作成に失敗した場合、ダミーオブジェクトを使用
        if (import.meta.env.DEV) {
            console.warn('Failed to initialize Echo, using dummy object:', error);
        }
        const dummyChannel = {
            listen: () => {},
            stopListening: () => {},
            error: () => {},
        };
        window.Echo = {
            private: () => dummyChannel,
            channel: () => dummyChannel,
            leave: () => {},
            disconnect: () => {},
        } as any;
    }
} else {
    // Reverbが設定されていない場合はダミーのEchoオブジェクトを作成
    const dummyChannel = {
        listen: () => {},
        stopListening: () => {},
        error: () => {},
    };
    window.Echo = {
        private: () => dummyChannel,
        channel: () => dummyChannel,
        leave: () => {},
        disconnect: () => {},
    } as any;
    
    // 開発環境では、Reverbが設定されていないことをログに記録
    if (import.meta.env.DEV) {
        console.log('ℹ️ Reverb is not configured. Real-time features are disabled.');
    }
}

export default window.Echo;

