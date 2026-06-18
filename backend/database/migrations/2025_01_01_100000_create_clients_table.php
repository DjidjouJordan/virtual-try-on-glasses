<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Ajout de ->unique() pour s'assurer qu'un utilisateur n'a qu'un seul profil client (1-to-1)
            $table->foreignUuid('user_id')
                ->unique() 
                ->constrained('users')
                ->cascadeOnDelete();

            $table->decimal('ecart_pupillaire', 5, 2)->nullable();

            $table->enum('forme_visage', [
                'ovale',
                'rond',
                'carre',
                'coeur',
                'rectangle'
            ])->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};