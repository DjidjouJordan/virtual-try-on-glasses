<?php

namespace App\Http\Controllers;

use App\Models\Snapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SnapshotController extends Controller
{
    /** GET /api/snapshots */
    public function index(Request $request): JsonResponse
    {
        $snapshots = $request->user()->client
            ->snapshots()
            ->latest('date_capture')
            ->get();

        return response()->json($snapshots);
    }

    /** POST /api/snapshots  — générer() depuis le canvas AR (base64) */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|string', // base64 data URL
        ]);

        $client    = $request->user()->client;
        $imageData = $request->input('image');

        // Décoder et stocker l'image
        $base64    = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
        $binary    = base64_decode($base64);
        $filename  = 'snapshots/' . $client->id . '/' . Str::uuid() . '.png';

        Storage::disk('public')->put($filename, $binary);
        $imageUrl = Storage::disk('public')->url($filename);

        $snapshot = Snapshot::create([
            'client_id'    => $client->id,
            'image_url'    => $imageUrl,
            'date_capture' => now(),
        ]);

        return response()->json($snapshot, 201);
    }

    /** DELETE /api/snapshots/{id} */
    public function destroy(Request $request, Snapshot $snapshot): JsonResponse
    {
        if ($snapshot->client_id !== $request->user()->client->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // Supprimer le fichier physique
        $path = str_replace(Storage::disk('public')->url(''), '', $snapshot->image_url);
        Storage::disk('public')->delete($path);

        $snapshot->delete();

        return response()->json(['message' => 'Snapshot supprimé.']);
    }
}
