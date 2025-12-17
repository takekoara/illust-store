import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

window.Pusher = Pusher;

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
};

window.Echo = new Echo<any>(reverbConfig);

// デバッグ用: Echo接続状態をログに記録（開発環境のみ）
if (import.meta.env.DEV) {
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Echo connected to Reverb');
    });

    window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ Echo disconnected from Reverb');
    });

    window.Echo.connector.pusher.connection.bind('error', (error: any) => {
        // Reverbサーバーが起動していない場合は警告のみ（エラーを表示しない）
        if (error?.error?.data?.code === 1006 || error?.type === 'TransportError') {
            console.warn('⚠️ Reverb server is not running. Real-time features will not work.');
        } else {
            console.error('❌ Echo connection error:', error);
        }
    });
}

export default window.Echo;

