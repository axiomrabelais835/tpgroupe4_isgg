<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\StatistiquesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatistiquesController extends Controller
{
    public function __construct(private StatistiquesService $statistiques)
    {
    }

    /**
     * KPI principaux avec comparaison période précédente.
     */
    public function kpis(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->kpis(
                $request->input('de'),
                $request->input('a')
            )
        );
    }

    /**
     * Agrégat complet pour le tableau de bord.
     */
    public function tableauDeBord(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->tableauDeBord(
                $request->input('de'),
                $request->input('a'),
                (int) $request->input('mois', 12)
            )
        );
    }

    /**
     * Évolution mensuelle des inscriptions.
     */
    public function evolutionInscriptions(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->evolutionInscriptions((int) $request->input('mois', 12))
        );
    }

    /**
     * Répartition par statut.
     */
    public function repartitionStatuts(): JsonResponse
    {
        return response()->json($this->statistiques->repartitionStatuts());
    }

    /**
     * Répartition par sexe.
     */
    public function repartitionSexes(): JsonResponse
    {
        return response()->json($this->statistiques->repartitionSexes());
    }

    /**
     * Répartition par tranche d'âge.
     */
    public function repartitionTranchesAge(): JsonResponse
    {
        return response()->json($this->statistiques->repartitionTranchesAge());
    }

    /**
     * Top formations les plus demandées.
     */
    public function topFormations(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->topFormations((int) $request->input('limite', 5))
        );
    }

    /**
     * Inscriptions par formation.
     */
    public function inscriptionsParFormation(): JsonResponse
    {
        return response()->json($this->statistiques->inscriptionsParFormation());
    }

    /**
     * Répartition par catégorie.
     */
    public function repartitionCategories(): JsonResponse
    {
        return response()->json($this->statistiques->repartitionCategories());
    }

    /**
     * Revenus mensuels.
     */
    public function revenusMensuels(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->revenusMensuels((int) $request->input('mois', 12))
        );
    }

    /**
     * Taux de remplissage par formation.
     */
    public function remplissageFormations(): JsonResponse
    {
        return response()->json($this->statistiques->remplissageFormations());
    }

    /**
     * Formations bientôt complètes.
     */
    public function formationsBientotCompletes(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->formationsBientotCompletes((float) $request->input('seuil', 80))
        );
    }

    /**
     * Dernières inscriptions.
     */
    public function dernieresInscriptions(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->dernieresInscriptions((int) $request->input('limite', 5))
        );
    }

    /**
     * Paiements récents.
     */
    public function paiementsRecents(Request $request): JsonResponse
    {
        return response()->json(
            $this->statistiques->paiementsRecents((int) $request->input('limite', 5))
        );
    }
}
