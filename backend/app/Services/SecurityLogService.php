<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SecurityLogService
{
    /**
     * Log sécurité utilisateur (login, actions sensibles, etc.)
     */
    public function log(string $userId, string $event, array $context = []): void
    {
        Log::info('SECURITY_EVENT', [
            'user_id' => $userId,
            'event' => $event,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'context' => $context,
            'date' => now(),
        ]);
    }

    public function failedLogin(string $email): void
    {
        Log::warning('FAILED_LOGIN', [
            'email' => $email,
            'ip' => request()->ip(),
            'date' => now()->toDateTimeString(),
        ]);
    }

    public function logout(string $userId): void
    {
        $this->log($userId, 'logout');
    }
}