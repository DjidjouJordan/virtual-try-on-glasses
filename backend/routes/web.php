<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use App\Services\CampayService;

Route::get('/campay-test', function (CampayService $campay) {
    return response()->json([
        'token_found' => !empty(config('campay.permanent_token')),
        'base_url' => config('campay.base_url')
    ]);
});