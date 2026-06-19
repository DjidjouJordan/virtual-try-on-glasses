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
        Schema::create('payments', function (Blueprint $table) {

            $table->id();

            $table->uuid('order_id');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->cascadeOnDelete();

            $table->string('campay_reference')->nullable();

            $table->string('external_reference')->nullable();

            $table->string('phone_number');

            $table->decimal('amount', 10, 2);

            $table->string('operator')->nullable();

            $table->enum('status', [
                'pending',
                'successful',
                'failed'
            ])->default('pending');

            $table->json('raw_response')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
