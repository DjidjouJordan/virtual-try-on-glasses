<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    /** GET /api/favoris */
    public function index(Request $request): JsonResponse
    {
        $client   = $request->user()->client;
        $favoris  = $client->favoris()->with('monture.modele3D')->get();

        return response()->json($favoris);
    }

    /** POST /api/favoris  — ajouterFavori() */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'monture_id' => 'required|uuid|exists:montures,id',
        ]);

        $client = $request->user()->client;

        $favori = Favori::firstOrCreate([
            'client_id'  => $client->id,
            'monture_id' => $data['monture_id'],
        ], [
            'date_ajout' => now(),
        ]);

        return response()->json($favori->load('monture'), 201);
    }

    /** DELETE /api/favoris/{id}  — supprimer() */
    public function destroy(Request $request, Favori $favori): JsonResponse
    {
        // Sécurité : seul le propriétaire peut supprimer
        if ($favori->client_id !== $request->user()->client->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $favori->delete();

        return response()->json(['message' => 'Favori supprimé.']);
    }
}
