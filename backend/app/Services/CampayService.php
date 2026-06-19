<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CampayService
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = config('campay.base_url');
        $this->token = config('campay.permanent_token');
    }

    /**
     * Demande de paiement Mobile Money
     */
    public function collect(
        string $phone,
        float $amount,
        string $description,
        string $externalReference
    ): array {

        // AJOUT DE ->withoutVerifying() POUR CONTOURNER L'ERREUR SSL LOCALE
        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Token '.$this->token,
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl.'/collect/', [
            'amount' => (string) intval($amount),
            'currency' => 'XAF',
            'from' => $phone,
            'description' => $description,
            'external_reference' => $externalReference,
        ]);

        return $response->json();
    }

    /**
     * Vérification statut transaction
     */
    public function transactionStatus(string $reference): array
    {
        // AJOUT DE ->withoutVerifying() ICI AUSSI
        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Token '.$this->token,
            'Content-Type' => 'application/json',
        ])->get(
            $this->baseUrl.'/transaction/'.$reference.'/'
        );

        return $response->json();
    }
}