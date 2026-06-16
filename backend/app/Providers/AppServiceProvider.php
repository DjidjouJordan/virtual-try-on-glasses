<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Gate utilisée par le middleware 'can:admin' dans les routes
        Gate::define('admin', fn ($user) => $user->isAdmin());
    }
}
