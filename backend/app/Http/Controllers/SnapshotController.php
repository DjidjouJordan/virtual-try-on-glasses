<?php

namespace App\Http\Controllers;

use App\Models\Snapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class SnapshotController extends Controller
{
    /**
     * GET /api/snapshots
     */
    public function index(Request $request): JsonResponse
    {
        $client = $request->user()->client;

        $snapshots = Snapshot::with('media')
            ->where('client_id', $client->id)
            ->latest()
            ->get();

        return response()->json($snapshots);
    }

    /**
     * POST /api/snapshots
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|string'
        ]);

        $snapshot = Snapshot::create([
            'client_id' => $request->user()->client->id,
            'date_capture' => now()
        ]);

        $media = $snapshot
            ->addMediaFromBase64($request->image)
            ->usingFileName(Str::uuid() . '.png')
            ->toMediaCollection('snapshot');

        return response()->json([
            'message' => 'Capture enregistrée',
            'media_id' => $media->id,
            'url' => $media->getUrl(),
            'thumb' => $media->getUrl('thumb'),
            'preview' => $media->getUrl('preview')
        ], 201);
    }

    /**
     * DELETE /api/snapshots/{snapshot}
     */
    public function destroy(
        Request $request,
        Snapshot $snapshot
    ): JsonResponse {

        if (
            $snapshot->client_id !==
            $request->user()->client->id
        ) {
            return response()->json([
                'message' => 'Accès refusé.'
            ], 403);
        }

        $snapshot->delete();

        return response()->json([
            'message' => 'Snapshot supprimé.'
        ]);
    }

    /**
     * DELETE /api/snapshots/media/{media}
     */
    public function deleteImage(
        Request $request,
        Media $media
    ): JsonResponse {

        if (
            $media->model_type !== Snapshot::class ||
            $media->model->client_id !==
            $request->user()->client->id
        ) {
            abort(403, 'Non autorisé');
        }

        $media->delete();

        return response()->json([
            'message' => 'Capture supprimée'
        ]);
    }
}