<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withCommands([
        \App\Console\Commands\CleanupPendingOrders::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Exclude webhook routes from CSRF protection
        $middleware->validateCsrfTokens(except: [
            'webhook/stripe',
        ]);

        // Register admin middleware alias
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, \Illuminate\Http\Request $request) {
            if ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                $status = $exception->getStatusCode();
                
                if (in_array($status, [403, 404, 500])) {
                    // Check if this is an Inertia request
                    if ($request->header('X-Inertia')) {
                        return \Inertia\Inertia::render("Errors/{$status}", [
                            'message' => $exception->getMessage() ?: null,
                        ])->toResponse($request)->setStatusCode($status);
                    }
                    
                    // For non-Inertia requests, return a JSON response
                    return response()->json([
                        'message' => $exception->getMessage() ?: 'エラーが発生しました。',
                    ], $status);
                }
            }
        });
    })->create();
