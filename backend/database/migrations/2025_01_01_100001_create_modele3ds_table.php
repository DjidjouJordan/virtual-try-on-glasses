<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modele3ds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // $table->string('url_fichier');
            $table->string('scale_offset')->default('1.0');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modele3ds');
    }
};
