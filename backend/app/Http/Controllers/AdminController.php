<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Monture;
use App\Models\Snapshot;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /** GET /api/admin/stats  — consulterStats() */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users'     => User::count(),
            'total_clients'   => Client::count(),
            'total_montures'  => Monture::count(),
            'total_snapshots' => Snapshot::count(),
            'montures_recent' => Monture::with('modele3D')->latest()->take(5)->get(),
        ]);
    }

    /** GET /api/admin/montures  — gererMonture() */
    public function montures(): JsonResponse
    {
        return response()->json(
            Monture::with('modele3D')->latest()->paginate(20)
        );
    }
}
