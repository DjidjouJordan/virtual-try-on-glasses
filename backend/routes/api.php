<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\MontureController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SnapshotController;
use Illuminate\Support\Facades\Route;

// ─── Auth (public) ──────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ─── Catalogue (public) ─────────────────────────────────────────────────────
Route::get('/montures',      [MontureController::class, 'index']);
Route::get('/montures/{monture}', [MontureController::class, 'show']);

// ─── Protégé par Sanctum ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Profil client
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Favoris
    Route::get('/favoris',          [FavoriController::class, 'index']);
    Route::post('/favoris',         [FavoriController::class, 'store']);
    Route::delete('/favoris/{favori}', [FavoriController::class, 'destroy']);

    // Snapshots
    Route::get('/snapshots',              [SnapshotController::class, 'index']);
    Route::post('/snapshots',             [SnapshotController::class, 'store']);
    Route::delete('/snapshots/{snapshot}', [SnapshotController::class, 'destroy']);

    // ─── Admin uniquement ───────────────────────────────────────────────────
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/stats',    [AdminController::class, 'stats']);
        Route::get('/admin/montures', [AdminController::class, 'montures']);
        Route::post('/montures',              [MontureController::class, 'store']);
        Route::put('/montures/{monture}',     [MontureController::class, 'update']);
        Route::delete('/montures/{monture}',  [MontureController::class, 'destroy']);
    });
});
