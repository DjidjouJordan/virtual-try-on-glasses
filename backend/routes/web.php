<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/{path}', function (string $path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');

use App\Services\CampayService;

Route::get('/campay-test', function (CampayService $campay) {
    return response()->json([
        'token_found' => !empty(config('campay.permanent_token')),
        'base_url' => config('campay.base_url')
    ]);
});