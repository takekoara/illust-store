<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // 本番環境でHTTPSを強制（Renderなどのリバースプロキシ環境で必要）
        if (config('app.env') === 'production' && config('app.url')) {
            $url = parse_url(config('app.url'));
            if (isset($url['scheme']) && $url['scheme'] === 'https') {
                URL::forceScheme('https');
            }
        }
    }
}
