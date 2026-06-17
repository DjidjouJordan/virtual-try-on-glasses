<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {

            $table->uuid('id')->primary();

            $table->string('email')->index();
            $table->string('code', 6);
            $table->string('purpose', 50);

            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();

            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('blocked_until')->nullable();

            $table->timestamps();

            $table->index(['email', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};