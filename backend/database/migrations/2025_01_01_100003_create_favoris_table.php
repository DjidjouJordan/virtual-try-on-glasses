<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoris', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')
                ->references('user_id')
                ->on('clients')
                ->cascadeOnDelete();
            $table->foreignUuid('monture_id')->constrained('montures')->cascadeOnDelete();
            $table->timestamp('date_ajout')->useCurrent();
            $table->unique(['client_id', 'monture_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoris');
    }
};

