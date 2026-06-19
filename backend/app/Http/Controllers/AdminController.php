<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Monture;
use App\Models\Snapshot;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Dashboard
     * GET /api/admin/stats
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),

            'total_clients' => Client::count(),

            'total_montures' => Monture::count(),

            'total_snapshots' => Snapshot::count(),

            'recent_montures' => Monture::with('modele3D')
                ->latest()
                ->take(5)
                ->get(),

            'recent_snapshots' => Snapshot::with('media')
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * Liste paginée des montures
     * GET /api/admin/montures
     */
    public function montures(): JsonResponse
    {
        $montures = Monture::with([
            'modele3D',
            'categorie'
        ])
        ->latest()
        ->paginate(20);

        return response()->json($montures);
    }
}