<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /** GET /api/profile */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'client.favoris.monture',
            'client.snapshots',
        ]);

        return response()->json($user);
    }

    /** PUT /api/profile  — modifierProfil() */
    public function update(Request $request): JsonResponse
    {
        $user   = $request->user();
        $client = $user->client;

        $userData = $request->validate([
            'nom'   => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
        ]);

        $clientData = $request->validate([
            'ecart_pupillaire' => 'sometimes|numeric|min:40|max:100',
            'forme_visage'     => 'sometimes|in:ovale,rond,carre,coeur,rectangle',
        ]);

        $user->update($userData);
        $client->update($clientData);

        return response()->json($user->fresh()->load('client'));
    }
}
