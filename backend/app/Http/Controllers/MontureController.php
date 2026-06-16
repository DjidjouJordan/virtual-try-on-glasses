<?php

namespace App\Http\Controllers;

use App\Models\Monture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MontureController extends Controller
{
    /** GET /api/montures */
    public function index(): JsonResponse
    {
        $montures = Monture::with('modele3D')->latest()->get();

        return response()->json($montures);
    }

    /** GET /api/montures/{id} */
    public function show(Monture $monture): JsonResponse
    {
        return response()->json($monture->load('modele3D'));
    }

    /** POST /api/montures  (Admin uniquement) */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'modele'       => 'required|string|max:255',
            'prix'         => 'required|numeric|min:0',
            'description'  => 'nullable|string',
            'image_url'    => 'nullable|url',
            'modele3d_id'  => 'required|uuid|exists:modele3ds,id',
        ]);

        $monture = Monture::create($data);

        return response()->json($monture->load('modele3D'), 201);
    }

    /** PUT /api/montures/{id}  (Admin uniquement) */
    public function update(Request $request, Monture $monture): JsonResponse
    {
        $data = $request->validate([
            'modele'      => 'sometimes|string|max:255',
            'prix'        => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url',
            'modele3d_id' => 'sometimes|uuid|exists:modele3ds,id',
        ]);

        $monture->update($data);

        return response()->json($monture->load('modele3D'));
    }

    /** DELETE /api/montures/{id}  (Admin uniquement) */
    public function destroy(Monture $monture): JsonResponse
    {
        $monture->delete();

        return response()->json(['message' => 'Monture supprimée.']);
    }
}
