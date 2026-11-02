<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')
                ->constrained('etudiants')
                ->cascadeOnDelete();
            $table->foreignId('formation_id')
                ->constrained('formations')
                ->cascadeOnDelete();
            $table->date('date_inscription');
            $table->enum('statut', ['en_attente', 'validee', 'annulee', 'terminee'])->default('en_attente');
            $table->decimal('note_finale', 5, 2)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->unique(['etudiant_id', 'formation_id']);
            $table->index('statut');
            $table->index('date_inscription');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
