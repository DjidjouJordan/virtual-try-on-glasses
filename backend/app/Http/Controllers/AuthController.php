<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function sendRegisterOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $this->authService->sendRegisterOtp($request->email);

        return response()->json(['message' => 'OTP envoyé']);
    }

    public function verifyRegisterOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        $user = $this->authService->verifyRegisterOtp(
            $request->email,
            $request->code
        );

        return response()->json(['user' => $user]);
    }

    public function sendLoginOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $this->authService->sendLoginOtp($request->email);

        return response()->json(['message' => 'OTP envoyé']);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        return response()->json(
            $this->authService->verifyLoginOtp(
                $request->email,
                $request->code
            )
        );
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

        return response()->json(['message' => 'Mot de passe modifié']);
    }

    public function updateProfile(Request $request)
    {
        return response()->json(
            $this->authService->updateProfile(
                $request->user(),
                $request->all()
            )
        );
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6'
        ]);

        $this->authService->changePassword(
            $request->user(),
            $request->old_password,
            $request->new_password
        );

        return response()->json(['message' => 'Mot de passe changé']);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Déconnecté']);
    }
}