<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function register(Request $request)
    {
        $request->validate([
            'nom' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        return $this->authService->register($request->all());
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        return $this->authService->login(
            $request->email,
            $request->password
        );
    }

    public function sendRegisterOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $this->authService->sendRegisterOtp($request->email);
        return ['message' => 'OTP envoyé'];
    }

    public function verifyRegisterOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        return $this->authService->verifyRegisterOtp(
            $request->email,
            $request->code
        );
    }

    public function sendResetPasswordOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $this->authService->sendResetPasswordOtp($request->email);
        return ['message' => 'OTP envoyé'];
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
            'password' => 'required|min:6'
        ]);

        $this->authService->resetPassword(
            $request->email,
            $request->code,
            $request->password
        );

        return ['message' => 'Mot de passe modifié'];
    }

    public function updateProfile(Request $request)
    {
        return $this->authService->updateProfile(
            $request->user(),
            $request->all()
        );
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6'
        ]);

        return $this->authService->changePassword(
            $request->user(),
            $request->old_password,
            $request->new_password
        );
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());
        return ['message' => 'Déconnecté'];
    }
}