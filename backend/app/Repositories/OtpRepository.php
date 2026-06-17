<?php

namespace App\Repositories;

use App\Models\OtpCode;

class OtpRepository
{
    public function create(array $data): OtpCode
    {
        return OtpCode::create($data);
    }

    public function findLatest(
        string $email,
        string $purpose
    ): ?OtpCode {
        return OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->latest()
            ->first();
    }

    public function deleteOld(
        string $email,
        string $purpose
    ): void {
        OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->delete();
    }
}