<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\MontureController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SnapshotController;
use Illuminate\Support\Facades\Route;
use App\Services\CampayService;


/*
|--------------------------------------------------------------------------
| AUTH (OTP UNIQUEMENT POUR RESET PASSWORD + EMAIL VERIFICATION)
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    // REGISTER SIMPLE (PASSWORD OBLIGATOIRE)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register/otp', [AuthController::class, 'sendRegisterOtp']);
    Route::post('/register/verify', [AuthController::class, 'verifyRegisterOtp']);

    // LOGIN NORMAL (PASSWORD + SANCTUM)
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    // FORGOT PASSWORD (OTP)
    Route::post('/password/forgot', [AuthController::class, 'sendResetOtp']);
    Route::post('/password/reset', [AuthController::class, 'resetPasswordWithOtp']);

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED ROUTES
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        // Route::put('/profile', [AuthController::class, 'updateProfile']);

        Route::post('/password/change', [AuthController::class, 'changePassword']);

        Route::post('/token/refresh', [AuthController::class, 'refreshToken']);
    });
});

/*
|--------------------------------------------------------------------------
| PUBLIC CATALOGUE
|--------------------------------------------------------------------------
*/
Route::get('/montures', [MontureController::class, 'index']);
Route::get('/montures/{monture}', [MontureController::class, 'show']);

/*
|--------------------------------------------------------------------------
| PROTECTED
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::apiResource('favoris', FavoriController::class)->only(['index', 'store', 'destroy']);

    Route::apiResource('snapshots', SnapshotController::class)->only(['index', 'store', 'destroy']);

    Route::delete('/snapshots/media/{media}', [SnapshotController::class, 'deleteImage']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */
    Route::middleware('can:admin')->group(function () {

        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/montures', [AdminController::class, 'montures']);

        Route::post('/montures', [MontureController::class, 'store']);
        Route::put('/montures/{monture}', [MontureController::class, 'update']);
        Route::delete('/montures/{monture}', [MontureController::class, 'destroy']);
        Route::delete('/montures/{monture}/media/{media}', [MontureController::class, 'deleteMedia']);
    });
});


// Routes sécurisées nécessitant que l'utilisateur Nuxt soit connecté via Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payments/status/{reference}', [PaymentController::class, 'status']);
});

// Le Webhook DOIT être public car l'IPN de CamPay n'a pas accès à tes tokens de session Sanctum
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);