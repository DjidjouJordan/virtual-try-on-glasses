<?php

namespace App\Services;

use App\Models\User;
use App\Services\OtpService;
use App\Repositories\AuthRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private AuthRepository $repo,
        private OtpService $otpService
    ) {}

    /* =========================
       REGISTER STEP 1
       ========================= */
    public function register(array $data): User
    {
        return $this->repo->create([
            'id' => Str::uuid(),
            'nom' => $data['nom'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'client',
            'email_verified_at' => null
        ]);
    }

    /* =========================
       REGISTER OTP (EMAIL VERIFY)
       ========================= */
    public function sendRegisterOtp(string $email): void
    {
        $this->otpService->generate($email, 'verify_email');
    }

    public function verifyRegisterOtp(string $email, string $code): User
    {
        $this->otpService->verify($email, 'verify_email', $code);

        $user = $this->repo->findByEmail($email);

        $user->update([
            'email_verified_at' => now()
        ]);

        $user->client()->create([
            'id' => Str::uuid(),
            'ecart_pupillaire' => null,
            'forme_visage' => null,
        ]);

        return $user;
    }

    /* =========================
       LOGIN (PASSWORD ONLY)
       ========================= */
    public function login(string $email, string $password): array
    {
        $user = $this->repo->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Identifiants invalides'
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;
        $user->load('client');

        return compact('user', 'token');
    }

    /* =========================
       FORGOT PASSWORD (OTP)
       ========================= */
    public function sendResetPasswordOtp(string $email): void
    {
        $this->otpService->generate($email, 'reset_password');
    }

    public function resetPassword(string $email, string $code, string $password): void
    {
        $this->otpService->verify($email, 'reset_password', $code);

        $user = $this->repo->findByEmail($email);

        $user->update([
            'password' => bcrypt($password)
        ]);
    }

    /* =========================
       PROFILE
       ========================= */
    public function updateProfile(User $user, array $data): User
    {
        return $this->repo->update($user, $data);
    }

    public function changePassword(User $user, string $old, string $new): void
    {
        if (!Hash::check($old, $user->password)) {
            throw ValidationException::withMessages([
                'old_password' => 'Mot de passe incorrect'
            ]);
        }

        $user->update([
            'password' => bcrypt($new)
        ]);
    }

    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }

    public function refreshToken(User $user): array
    {
        $user->tokens()->delete();

        return [
            'token' => $user->createToken('auth')->plainTextToken
        ];
    }

    public function sendEmailVerificationOtp(string $email): void
    {
        $this->otpService->generate($email, 'email_verification');
    }

    public function verifyEmail(string $email, string $code): void
    {
        $this->otpService->verify($email, 'email_verification', $code);

        $user = $this->repo->findByEmail($email);

        $user->update([
            'email_verified_at' => now()
        ]);
    }
}