<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategorieFormationController;
use App\Http\Controllers\Api\V1\EtudiantController;
use App\Http\Controllers\Api\V1\FormationController;
use App\Http\Controllers\Api\V1\InscriptionController;
use App\Http\Controllers\Api\V1\PaiementController;
use App\Http\Controllers\Api\V1\StatistiquesController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentification (publique)
    Route::post('auth/connexion', [AuthController::class, 'connexion']);

    // Routes protégées
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/utilisateur', [AuthController::class, 'utilisateur']);
        Route::post('auth/deconnexion', [AuthController::class, 'deconnexion']);

        Route::apiResource('etudiants', EtudiantController::class);
        Route::post('etudiants/{etudiant}/restaurer', [EtudiantController::class, 'restaurer'])->withTrashed()->name('etudiants.restaurer');
        Route::get('etudiants-export/csv', [EtudiantController::class, 'exporter'])->name('etudiants.exporter');

        Route::apiResource('formations', FormationController::class);

        Route::apiResource('categories', CategorieFormationController::class)->parameters([
            'categories' => 'categorie',
        ]);

        Route::apiResource('inscriptions', InscriptionController::class);

        Route::apiResource('paiements', PaiementController::class);

        // Statistiques
        Route::prefix('statistiques')->group(function () {
            Route::get('tableau-de-bord', [StatistiquesController::class, 'tableauDeBord']);
            Route::get('kpis', [StatistiquesController::class, 'kpis']);
            Route::get('evolution-inscriptions', [StatistiquesController::class, 'evolutionInscriptions']);
            Route::get('repartition-statuts', [StatistiquesController::class, 'repartitionStatuts']);
            Route::get('repartition-sexes', [StatistiquesController::class, 'repartitionSexes']);
            Route::get('repartition-tranches-age', [StatistiquesController::class, 'repartitionTranchesAge']);
            Route::get('top-formations', [StatistiquesController::class, 'topFormations']);
            Route::get('inscriptions-par-formation', [StatistiquesController::class, 'inscriptionsParFormation']);
            Route::get('repartition-categories', [StatistiquesController::class, 'repartitionCategories']);
            Route::get('revenus-mensuels', [StatistiquesController::class, 'revenusMensuels']);
            Route::get('remplissage-formations', [StatistiquesController::class, 'remplissageFormations']);
            Route::get('formations-bientot-completes', [StatistiquesController::class, 'formationsBientotCompletes']);
            Route::get('dernieres-inscriptions', [StatistiquesController::class, 'dernieresInscriptions']);
            Route::get('paiements-recents', [StatistiquesController::class, 'paiementsRecents']);
        });
    });
});
