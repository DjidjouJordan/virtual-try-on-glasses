<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monture;
use App\Models\Order;
use App\Models\Payment;
use App\Services\CampayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected CampayService $campayService;

    public function __construct(CampayService $campayService)
    {
        $this->campayService = $campayService;
    }

    /**
     * POST /api/payments/initiate
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number'       => 'required|string|regex:/^2376[0-9]{8}$/',
            'items'              => 'required|array|min:1',
            'items.*.monture_id' => 'required|exists:montures,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        try {
            $order = DB::transaction(function () use ($request) {
                $user = $request->user();
                $totalAmount = 0;
                $itemsToCreate = [];

                foreach ($request->items as $item) {
                    $monture = Monture::findOrFail($item['monture_id']);
                    $subtotal = $monture->prix * $item['quantity'];
                    $totalAmount += $subtotal;

                    $itemsToCreate[] = [
                        'monture_id' => $monture->id,
                        'quantity'   => $item['quantity'],
                        'unit_price' => $monture->prix,
                        'subtotal'   => $subtotal,
                    ];
                }

                $orderRef = 'DPG-' . strtoupper(Str::random(8));
                $order = Order::create([
                    'user_id'      => $user->id,
                    'total_amount' => $totalAmount,
                    'status'       => 'pending',
                    'reference'    => $orderRef,
                ]);

                foreach ($itemsToCreate as $itemData) {
                    $order->items()->create($itemData);
                }

                return $order;
            });

            $description = "Paiement de la commande " . $order->reference . " sur DPGlasses";
            $campayResponse = $this->campayService->collect(
                $request->phone_number,
                $order->total_amount,
                $description,
                $order->reference
            );

            if (!isset($campayResponse['reference'])) {
                Log::error('Échec d\'initiation CamPay', ['response' => $campayResponse]);
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Impossible de joindre le service CamPay. Vérifiez le numéro.'
                ], 400);
            }

            // CORRECTION ICI : Utilisation des bonnes colonnes de ta migration
            Payment::create([
                'order_id'           => $order->id,
                'campay_reference'   => $campayResponse['reference'],
                'external_reference' => $order->reference,
                'amount'             => $order->total_amount,
                'status'             => 'pending',
                'phone_number'       => $request->phone_number,
            ]);

            return response()->json([
                'status'           => 'success',
                'message'          => 'Demande envoyée. Saisissez votre code PIN sur votre téléphone.',
                'order_reference'  => $order->reference,
                'campay_reference' => $campayResponse['reference']
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur critique paiement: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Une erreur système est survenue.'], 500);
        }
    }

    /**
     * GET /api/payments/status/{reference}
     */
    public function status(string $reference): JsonResponse
    {
        // CORRECTION ICI : Recherche par campay_reference
        $payment = Payment::where('campay_reference', $reference)->firstOrFail();
        
        $campayStatus = $this->campayService->transactionStatus($reference);

        if (isset($campayStatus['status'])) {
            $status = strtoupper($campayStatus['status']);

            // CORRECTION ICI : On utilise 'successful' au lieu de 'success' pour respecter l'ENUM de ta DB
            if ($status === 'SUCCESSFUL' && $payment->status !== 'successful') {
                $payment->update(['status' => 'successful']);
                $payment->order->update(['status' => 'paid']);
            } elseif ($status === 'FAILED' && $payment->status !== 'failed') {
                $payment->update(['status' => 'failed']);
                $payment->order->update(['status' => 'failed']);
            }
        }

        return response()->json([
            'payment_status' => $payment->status, // renverra 'pending', 'successful' ou 'failed'
            'order_status'   => $payment->order->status
        ]);
    }

    /**
     * POST /api/payments/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::info('CamPay Webhook exécuté', $request->all());

        $reference = $request->input('reference');
        $status = strtoupper($request->input('status', ''));

        if (!$reference) {
            return response()->json(['message' => 'Données incomplètes'], 400);
        }

        // CORRECTION ICI : Recherche par campay_reference
        $payment = Payment::where('campay_reference', $reference)->first();

        if ($payment) {
            if ($status === 'SUCCESSFUL' && $payment->status !== 'successful') {
                $payment->update(['status' => 'successful']);
                $payment->order->update(['status' => 'paid']);
            } elseif ($status === 'FAILED' && $payment->status !== 'failed') {
                $payment->update(['status' => 'failed']);
                $payment->order->update(['status' => 'failed']);
            }
        }

        return response()->json(['status' => 'accepted'], 200);
    }
}