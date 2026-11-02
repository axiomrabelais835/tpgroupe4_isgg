<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiants', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->enum('sexe', ['M', 'F']);
            $table->date('date_naissance');
            $table->string('lieu_naissance')->nullable();
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->default('Bénin');
            $table->string('photo')->nullable();
            $table->enum('statut', ['actif', 'suspendu', 'diplome', 'abandon'])->default('actif');
            $table->date('date_inscription');
            $table->timestamps();
            $table->softDeletes();

            $table->index('statut');
            $table->index('ville');
            $table->index('date_inscription');
            $table->index(['nom', 'prenom']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};
