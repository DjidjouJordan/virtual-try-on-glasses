<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FavoriController extends Controller
{
    /** GET /api/favoris */
    public function index(Request $request): JsonResponse
    {
        $client = $request->user()->client()->first();
        if (!$client) {
            return response()->json([]);
        }
        $favoris  = $client->favoris()->with('monture.modele3D')->get();

        return response()->json($favoris);
    }

    /** POST /api/favoris  — ajouterFavori() */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'monture_id' => 'required|uuid|exists:montures,id',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // 🔥 FORCE récupération client ou création
        $client = $user->client;

        if (!$client) {
            $client = $user->client()->create([
                'id' => Str::uuid(),
                'ecart_pupillaire' => null,
                'forme_visage' => null,
            ]);
        }

        if (!$client || !$client->id) {
            return response()->json([
                'message' => 'Impossible de créer/récupérer le client'
            ], 500);
        }

        $favori = Favori::updateOrCreate(
            [
                'client_id' => $client->id,
                'monture_id' => $data['monture_id'],
            ],
            [
                'date_ajout' => now(),
            ]
        );

        return response()->json($favori->load('monture'), 201);
    }

    /** DELETE /api/favoris/{id}  — supprimer() */
    public function destroy(Request $request, Favori $favori): JsonResponse
    {
        // Sécurité : seul le propriétaire peut supprimer
        $favori = Favori::where('id', $favori->id)
            ->where('client_id', $request->user()->client->id)
            ->firstOrFail();

        $favori->delete();

        return response()->json(['message' => 'Favori supprimé.']);
    }
}
