<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MtnMomoService
{
    private string $baseUrl;
    private string $subscriptionKey;
    private string $apiUser;
    private string $apiKey;
    private string $environment;
    private string $currency;

    public function __construct()
    {
        $this->baseUrl         = config('momo.base_url', 'https://sandbox.momodeveloper.mtn.com');
        $this->subscriptionKey = config('momo.subscription_key', '');
        $this->apiUser         = config('momo.api_user', '');
        $this->apiKey          = config('momo.api_key', '');
        $this->environment     = config('momo.environment', 'sandbox');
        $this->currency        = config('momo.currency', 'EUR'); // EUR en sandbox, XAF en prod
    }

    /** Retourne true si les clés MTN ne sont pas encore configurées. */
    private function isSimulationMode(): bool
    {
        return empty($this->subscriptionKey) || empty($this->apiUser) || empty($this->apiKey);
    }

    /**
     * Obtient un token OAuth2 pour la Collection API.
     */
    public function getToken(): string
    {
        if ($this->isSimulationMode()) return 'simulation-token';

        $credentials = base64_encode("{$this->apiUser}:{$this->apiKey}");

        $response = Http::withHeaders([
            'Authorization'              => "Basic {$credentials}",
            'Ocp-Apim-Subscription-Key'  => $this->subscriptionKey,
        ])->post("{$this->baseUrl}/collection/token/");

        if (! $response->successful()) {
            throw new \RuntimeException('MTN MoMo: impossible d\'obtenir le token. ' . $response->body());
        }

        return $response->json('access_token');
    }

    /**
     * Initie une demande de paiement MoMo.
     * En mode simulation (clés absentes), enregistre l'heure de création
     * pour simuler une confirmation automatique après 8 secondes.
     */
    public function requestToPay(
        float $amount,
        string $phone,
        string $referenceId,
        string $description = 'Achat DPGlasses'
    ): bool {
        if ($this->isSimulationMode()) {
            // Stocke le timestamp de la demande en cache (8s avant confirmation simulée)
            cache()->put("momo_sim_{$referenceId}", now()->timestamp, 60);
            \Log::info("[MTN SIMULATION] requestToPay {$referenceId} montant={$amount} tel={$phone}");
            return true;
        }

        $token = $this->getToken();
        $phone = ltrim(str_replace(['+', ' ', '-'], '', $phone), '0');

        $response = Http::withHeaders([
            'Authorization'              => "Bearer {$token}",
            'X-Reference-Id'             => $referenceId,
            'X-Target-Environment'       => $this->environment,
            'Ocp-Apim-Subscription-Key'  => $this->subscriptionKey,
            'Content-Type'               => 'application/json',
        ])->post("{$this->baseUrl}/collection/v1_0/requesttopay", [
            'amount'      => (string) $amount,
            'currency'    => $this->currency,
            'externalId'  => $referenceId,
            'payer'       => [
                'partyIdType' => 'MSISDN',
                'partyId'     => $phone,
            ],
            'payerMessage' => $description,
            'payeeNote'    => $description,
        ]);

        return $response->status() === 202;
    }

    /**
     * Vérifie le statut d'une transaction.
     * En mode simulation : PENDING pendant 8s, puis SUCCESSFUL.
     *
     * @return string PENDING | SUCCESSFUL | FAILED
     */
    public function checkStatus(string $referenceId): string
    {
        if ($this->isSimulationMode()) {
            $createdAt = cache()->get("momo_sim_{$referenceId}");
            if (! $createdAt) return 'FAILED';
            $elapsed = now()->timestamp - $createdAt;
            \Log::info("[MTN SIMULATION] checkStatus {$referenceId} elapsed={$elapsed}s");
            return $elapsed >= 8 ? 'SUCCESSFUL' : 'PENDING';
        }

        $token = $this->getToken();

        $response = Http::withHeaders([
            'Authorization'             => "Bearer {$token}",
            'X-Target-Environment'      => $this->environment,
            'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
        ])->get("{$this->baseUrl}/collection/v1_0/requesttopay/{$referenceId}");

        if (! $response->successful()) return 'FAILED';

        return $response->json('status', 'PENDING');
    }
}
