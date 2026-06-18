<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /** * GET /api/profile 
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'client.favoris.monture',
            'client.snapshots',
        ]);

        return response()->json($user);
    }

    /** * PUT /api/profile — Enregistre les infos + l'Avatar
     */
    public function update(Request $request): JsonResponse
    {
        $user   = $request->user();
        $client = $user->client;

        // 1. Validation des données de l'utilisateur (incluant l'avatar en string base64)
        $validatedUserData = $request->validate([
            'nom'    => 'sometimes|string|max:255',
            'email'  => 'sometimes|email|unique:users,email,' . $user->id,
            'avatar' => 'sometimes|nullable|string', // Validation de la chaîne Base64
        ]);

        // 2. Validation des données techniques du client
        $clientData = $request->validate([
            'ecart_pupillaire' => 'sometimes|nullable|numeric|min:40|max:100',
            'forme_visage'     => 'sometimes|nullable|in:ovale,rond,carre,coeur,rectangle',
        ]);

        // 3. Extraction du champ 'avatar' pour ne pas faire planter l'update de la table 'users'
        $userData = collect($validatedUserData)->except('avatar')->toArray();
        
        // 4. Mises à jour des tables en BDD
        $user->update($userData);
        $client->update($clientData);

        // 🔥 5. TRAITEMENT DE L'AVATAR (Spatie MediaLibrary)
        if ($request->has('avatar') && !empty($request->avatar)) {
            // addMediaFromBase64 gère nativement les chaînes brutes et les Data URIs (data:image/...)
            $user->addMediaFromBase64($request->avatar)
                 ->toMediaCollection('avatar');
        }

        // 6. On retourne l'utilisateur frais avec sa relation client chargée.
        // Grâce au `protected $appends = ['avatar_url']` ajouté dans User.php,
        // la clé 'avatar_url' sera automatiquement injectée et contiendra l'URL valide !
        return response()->json($user->fresh()->load('client'));
    }
}