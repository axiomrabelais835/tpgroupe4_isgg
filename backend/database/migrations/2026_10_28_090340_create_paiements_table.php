<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')
                ->constrained('inscriptions')
                ->cascadeOnDelete();
            $table->decimal('montant', 10, 2);
            $table->enum('mode', ['especes', 'mobile_money', 'virement', 'carte'])->default('especes');
            $table->string('reference')->nullable();
            $table->date('date_paiement');
            $table->timestamps();

            $table->index('date_paiement');
            $table->index('mode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
