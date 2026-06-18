<?php

return [
    'base_url'         => env('MOMO_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),
    'subscription_key' => env('MOMO_SUBSCRIPTION_KEY', ''),
    'api_user'         => env('MOMO_API_USER', ''),
    'api_key'          => env('MOMO_API_KEY', ''),
    'environment'      => env('MOMO_ENVIRONMENT', 'sandbox'),
    'currency'         => env('MOMO_CURRENCY', 'EUR'), // EUR en sandbox, XAF en production
    'callback_url'     => env('MOMO_CALLBACK_URL', ''),
];
