<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Fix MySQL older versions
        Schema::defaultStringLength(191);

        /**
         * ADMIN GATE
         */
        Gate::define('admin', fn ($user) => $user?->isAdmin() ?? false);

        /**
         * Login RATE LIMITER (SECURE)
         * Combine IP + email pour éviter spam global
         */
        RateLimiter::for('login', function ($request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perMinute(3)->by($request->input('email')),
            ];
        });

        /**
         * GLOBAL OTP BACKUP LIMIT (optional)
         */
        RateLimiter::for('otp-global', function ($request) {
            return Limit::perMinute(10)
                ->by($request->ip());
        });
    }
}