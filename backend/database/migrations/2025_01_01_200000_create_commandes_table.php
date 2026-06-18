<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')
                ->references('user_id')
                ->on('clients')
                ->cascadeOnDelete();
            $table->decimal('montant', 10, 2);
            $table->enum('methode_paiement', ['mtn', 'orange'])->default('mtn');
            $table->string('telephone', 20);
            $table->enum('statut', ['en_attente', 'payee', 'echouee', 'annulee'])->default('en_attente');
            $table->string('reference_mtn', 36)->nullable()->unique();
            $table->json('articles');
            $table->timestamp('payee_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};

