<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categorie_formation_id')
                ->constrained('categories_formations')
                ->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('intitule');
            $table->text('description')->nullable();
            $table->unsignedInteger('duree_heures');
            $table->decimal('prix', 10, 2)->default(0);
            $table->enum('niveau', ['debutant', 'intermediaire', 'avance'])->default('debutant');
            $table->unsignedSmallInteger('capacite_max');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->enum('statut', ['planifiee', 'en_cours', 'terminee', 'annulee'])->default('planifiee');
            $table->timestamps();
            $table->softDeletes();

            $table->index('statut');
            $table->index('niveau');
            $table->index('date_debut');
            $table->index('intitule');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
