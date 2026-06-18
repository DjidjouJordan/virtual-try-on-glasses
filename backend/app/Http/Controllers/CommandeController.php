<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Services\MtnMomoService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommandeController extends Controller
{
    public function __construct(private MtnMomoService $momo) {}

    /**
     * Crée une commande et initie le paiement MTN MoMo.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'methode_paiement' => 'required|in:mtn,orange',
            'telephone'        => 'required|string|min:9',
            'montant_total'    => 'required|numeric|min:1',
            'articles'         => 'required|array|min:1',
            'articles.*.monture_id' => 'required|uuid|exists:montures,id',
            'articles.*.quantity'   => 'required|integer|min:1',
        ]);

        $client = $request->user()->client;

        if (! $client) {
            return response()->json(['message' => 'Profil client introuvable.'], 404);
        }

        $referenceId = (string) Str::uuid();

        $commande = Commande::create([
            'client_id'        => $client->id,
            'montant'          => $data['montant_total'],
            'methode_paiement' => $data['methode_paiement'],
            'telephone'        => $data['telephone'],
            'statut'           => 'en_attente',
            'reference_mtn'    => $referenceId,
            'articles'         => $data['articles'],
        ]);

        // Initier le paiement MTN MoMo
        try {
            $initiated = $this->momo->requestToPay(
                amount: $data['montant_total'],
                phone: $data['telephone'],
                referenceId: $referenceId,
                description: "Commande DPGlasses #{$commande->id}"
            );

            if (! $initiated) {
                $commande->update(['statut' => 'echouee']);
                return response()->json(['message' => 'Impossible d\'initier le paiement MTN.'], 502);
            }
        } catch (\Throwable $e) {
            $commande->update(['statut' => 'echouee']);
            return response()->json(['message' => 'Erreur MTN : ' . $e->getMessage()], 502);
        }

        return response()->json([
            'commande_id'  => $commande->id,
            'reference_mtn' => $referenceId,
            'statut'       => $commande->statut,
            'message'      => 'Prompt USSD envoyé. Confirmez sur votre téléphone.',
        ], 201);
    }

    /**
     * Vérifie le statut d'une commande (polling frontend).
     */
    public function status(Request $request, Commande $commande)
    {
        // Vérifier que la commande appartient au client connecté
        if ($commande->client_id !== $request->user()->client?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        // Si déjà finalisée, pas besoin d'appeler MTN
        if (in_array($commande->statut, ['payee', 'echouee', 'annulee'])) {
            return response()->json(['statut' => $commande->statut]);
        }

        // Interroger MTN
        $momoStatus = $this->momo->checkStatus($commande->reference_mtn);

        $statut = match ($momoStatus) {
            'SUCCESSFUL' => 'payee',
            'FAILED'     => 'echouee',
            default      => 'en_attente',
        };

        if ($statut !== 'en_attente') {
            $commande->update([
                'statut'   => $statut,
                'payee_le' => $statut === 'payee' ? now() : null,
            ]);
        }

        return response()->json(['statut' => $statut]);
    }

    /**
     * Webhook MTN MoMo — appelé automatiquement par MTN quand le statut change.
     */
    public function webhook(Request $request)
    {
        $referenceId = $request->header('X-Reference-Id')
            ?? $request->input('referenceId');

        if (! $referenceId) {
            return response()->json(['message' => 'Reference manquante.'], 400);
        }

        $commande = Commande::where('reference_mtn', $referenceId)->first();
        if (! $commande) {
            return response()->json(['message' => 'Commande introuvable.'], 404);
        }

        $momoStatus = $this->momo->checkStatus($referenceId);

        $statut = match ($momoStatus) {
            'SUCCESSFUL' => 'payee',
            'FAILED'     => 'echouee',
            default      => 'en_attente',
        };

        $commande->update([
            'statut'   => $statut,
            'payee_le' => $statut === 'payee' ? now() : null,
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Historique des commandes du client connecté.
     */
    public function index(Request $request)
    {
        $commandes = $request->user()->client
            ?->commandes()
            ->latest()
            ->get();

        return response()->json($commandes ?? []);
    }
}
