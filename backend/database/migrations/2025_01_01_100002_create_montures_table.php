<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('montures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom');
            $table->string('marque')->nullable();
            $table->decimal('prix', 8, 2);
            $table->text('description')->nullable();
            $table->string('categorie')->nullable();
            $table->string('couleur')->nullable()->default('black');
            $table->boolean('is_active')->default(true);
            // $table->string('image_url')->nullable();
            $table->foreignUuid('modele3d_id')->constrained('modele3ds')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('montures');
    }
};
