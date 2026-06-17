<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Repositories\OtpRepository;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function __construct(
        private OtpRepository $repository
    ) {}

    public function generate(string $email, string $purpose): void
    {
        $this->repository->deleteOld($email, $purpose);

        $otp = random_int(100000, 999999);

        $this->repository->create([
            'email' => $email,
            'code' => (string)$otp,
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($email)->queue(new OtpMail($otp, $purpose));
    }

    public function verify(string $email, string $purpose, string $code): bool
    {
        $otp = $this->repository->findLatest($email, $purpose);

        if (!$otp) {
            throw ValidationException::withMessages(['otp' => 'Code introuvable']);
        }

        if ($otp->isBlocked()) {
            throw ValidationException::withMessages(['otp' => 'Bloqué']);
        }

        if ($otp->isExpired()) {
            throw ValidationException::withMessages(['otp' => 'Expiré']);
        }

        if ($otp->code !== $code) {

            $otp->increment('attempts');

            if ($otp->attempts >= 5) {
                $otp->update([
                    'blocked_until' => now()->addMinutes(15)
                ]);
            }

            throw ValidationException::withMessages(['otp' => 'Code invalide']);
        }

        $otp->update(['verified_at' => now()]);

        return true;
    }
}