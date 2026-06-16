<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** POST /api/register */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'      => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'nom'      => $data['nom'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'client',
        ]);

        // Crée automatiquement le profil Client associé
        Client::create(['user_id' => $user->id]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('client'),
            'token' => $token,
        ], 201);
    }

    /** POST /api/login */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($data)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('client'),
            'token' => $token,
        ]);
    }

    /** POST /api/logout */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    /** GET /api/me */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('client'));
    }
}
