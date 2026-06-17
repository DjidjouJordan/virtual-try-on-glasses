<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Schema::table('modele3ds', function (Blueprint $table) {
        //     // Ajoute la colonne calibration si elle n'existe pas
        //     if (!Schema::hasColumn('modele3ds', 'calibration')) {
        //         $table->json('calibration')
        //             ->nullable()
        //             ->comment('Calibrations individuelles du modèle (rotationX, rotationY, rotationZ, positionY, positionZ)')
        //             ->after('scale_offset');
        //     }
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::table('modele3ds', function (Blueprint $table) {
        //     $table->dropColumn('calibration');
        // });
    }
};