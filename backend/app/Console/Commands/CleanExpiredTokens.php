<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CleanExpiredTokens extends Command
{
    protected $signature = 'app:clean-expired-tokens';
    protected $description = 'Clean expired Sanctum tokens';

    public function handle(): int
    {
        User::all()->each(function ($user) {
            $user->tokens()
                ->where('last_used_at', '<', now()->subDays(30))
                ->delete();
        });

        $this->info('Expired tokens cleaned successfully');

        return self::SUCCESS;
    }
}