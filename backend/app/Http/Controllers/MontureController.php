<?php

namespace App\Http\Controllers;

use App\Models\Modele3D;
use App\Models\Monture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MontureController extends Controller
{
    /** GET /api/montures */
    public function index(Request $request)
    {
        $montures = Monture::with(['media', 'modele3d.media'])
            ->when($request->boolean('is_active'), fn ($q) => $q->where('is_active', true))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $montures->through(fn ($monture) => $this->formatMonture($monture)),
            'meta' => [
                'current_page' => $montures->currentPage(),
                'last_page' => $montures->lastPage(),
                'total' => $montures->total(),
            ]
        ]);
    }

    /** GET /api/montures/{id} */
    public function show(Monture $monture): JsonResponse
    {
        $monture->load(['media', 'modele3d.media']);
        $monture->refresh();
        return response()->json([
            'data' => $this->formatMonture($monture)
        ]);
    }

    /** POST /api/montures  (Admin uniquement) */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'nullable|string|max:255',
            'prix' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'categorie' => 'nullable|string|max:100',
            'couleur' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'gallery' => 'nullable|array',
            'gallery.*' => 'file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'modele3d' => 'required|file|mimes:glb,gltf,obj|max:51200',
            'scale_offset' => 'nullable|numeric'
        ]);

        $modele3d = Modele3D::create([
            'id' => Str::uuid(),
            'scale_offset' => $validated['scale_offset'] ?? '1.0'
        ]);

        $modele3d->addMediaFromRequest('modele3d')->toMediaCollection('fichier3d');

        $monture = Monture::create([
            'id' => Str::uuid(),
            'nom' => $validated['nom'],
            'marque' => $validated['marque'] ?? null,
            'prix' => $validated['prix'],
            'description' => $validated['description'] ?? null,
            'categorie' => $validated['categorie'] ??  null,
            'couleur' => $validated['couleur'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'modele3d_id' => $modele3d->id
        ]);

        $monture->addMediaFromRequest('image')->toMediaCollection('image');

        if($request->hasFile('gallery')){
            foreach($request->file('gallery') as $file){
                $monture->addMedia($file)->toMediaCollection('gallery');
            }
        }

        $monture->load(['media', 'modele3d.media']);

        return response()->json([
            'message' => 'Monture créée',
            'data' => $this->formatMonture($monture)
        ], 201);
    }

    /** PUT /api/montures/{id}  (Admin uniquement) */
    public function update(Request $request, Monture $monture): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'marque' => 'nullable|string|max:255',
            'prix' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'categorie' => 'nullable|string|max:100',
            'couleur' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'gallery' => 'nullable|array',
            'gallery.*' => 'file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'modele3d' => 'required|file|mimes:glb,gltf,obj|max:51200',
            'scale_offset' => 'nullable|numeric'
        ]);

        $monture->update($validated);

        if($request->hasFile('image')){
            $monture->clearMediaCollection('image');
            $monture->addMediaFromRequest('image')->toMediaCollection('image');
        }

        if($request->hasFile('gallery')){
            foreach($request->file('gallery') as $file){
                $monture->addMedia($file)->toMediaCollection('gallery');
            }
        }

        if($request->hasFile('modele3d')){
            $monture->modele3d->clearMediaCollection('fichier3d');
            $monture->modele3d->addMediaFromRequest('modele3d')->toMediaCollection('fichier3d');
            $monture->modele3d->update(['scale_offset' => $validated['scale_offset'] ?? $monture->modele3d->scale_offset]);
        }

        $monture->load(['media', 'modele3d.media']);

        return response()->json([
            'message' => 'Monture mise à jour',
            'data' => $this->formatMonture($monture)
        ]);
    }

    /** DELETE /api/montures/{id}  (Admin uniquement) */
    public function destroy(Monture $monture): JsonResponse
    {
        $monture->modele3d->delete();
        $monture->delete();

        return response()->json(['message' => 'Monture supprimée.'], 204);
    }

    public function deleteMedia(Monture $monture, Media $media){
        if($media->model_id !== $monture->id){
            return response()->json(['message' => 'Media non trouvé'], 404);
        }

        $media->delete();
        return response()->json(['message' => 'Media supprimé'], 204);
    }

    private function formatMonture(Monture $monture): array{
        $fichier3d = $monture->modele3d ? $monture->modele3d->getFirstMedia('fichier3d') : null;
        $fileUrl = $fichier3d ? $fichier3d->getUrl() : '';

        return [
            'id' => $monture->id,
            'nom' => $monture->nom,
            'modele' => $monture->nom,
            'marque' => $monture->marque,
            'prix' => (float) $monture->prix,
            'description' => $monture->description,
            'categorie' => $monture->categorie,
            'couleur' => $monture->couleur,
            'is_active' => (bool) $monture->is_active,
            'created_at' => $monture->created_at,
            'updated_at' => $monture->updated_at,
            'image_url' => $monture->getFirstMediaUrl('image') ?: '',
            'image' => [
                'original' => $monture->getFirstMediaUrl('image') ?: '',
                'thumb' => $monture->getFirstMediaUrl('image', 'thumb') ?: '',
                'preview' => $monture->getFirstMediaUrl('image', 'preview') ?: '',
                'webp' => $monture->getFirstMediaUrl('image', 'webp') ?: '',
            ],
            'gallery' => $monture->getMedia('gallery')->map(fn ($media) =>[
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'preview' => $media->getUrl('preview'),
                'name' => $media->file_name,
                'size' => $media->size
            ]),
            'modele3d' => $monture->modele3d ? [
                'id' => $monture->modele3d->id,
                'scale_offset' => $monture->modele3d->scale_offset,
                'url' => $fileUrl,
                'url_fichier' => $fileUrl,
                'file_name' => $fichier3d?->file_name,
                'size' => $fichier3d?->size
            ] : null,
            'modele3_d' => $monture->modele3d ? [
                'id' => $monture->modele3d->id,
                'scale_offset' => $monture->modele3d->scale_offset,
                'url' => $fileUrl,
                'url_fichier' => $fileUrl,
                'file_name' => $fichier3d?->file_name,
                'size' => $fichier3d?->size
            ] : null
        ];
    }
}
