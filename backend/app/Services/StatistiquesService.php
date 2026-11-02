<?php

namespace App\Services;

use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\Paiement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatistiquesService
{
    /**
     * KPI principaux pour une période donnée, avec comparaison à la période précédente.
     */
    public function kpis(?string $de = null, ?string $a = null): array
    {
        $de = $de ? Carbon::parse($de) : now()->subMonths(11)->startOfMonth();
        $a = $a ? Carbon::parse($a) : now()->endOfDay();

        $dureeJours = $de->diffInDays($a) ?: 1;
        $dePrecedente = $de->copy()->subDays($dureeJours);
        $aPrecedente = $de->copy()->subDay();

        $totalEtudiants = Etudiant::count();
        $etudiantsActifs = Etudiant::where('statut', 'actif')->count();
        $formationsEnCours = Formation::where('statut', 'en_cours')->count();

        $inscriptionsPeriode = Inscription::whereBetween('date_inscription', [$de, $a])->count();
        $inscriptionsPeriodePrecedente = Inscription::whereBetween('date_inscription', [$dePrecedente, $aPrecedente])->count();

        $caPeriode = (float) Paiement::whereBetween('date_paiement', [$de, $a])->sum('montant');
        $caPeriodePrecedente = (float) Paiement::whereBetween('date_paiement', [$dePrecedente, $aPrecedente])->sum('montant');

        $tauxRemplissageMoyen = $this->tauxRemplissageMoyen();
        $tauxReussite = $this->tauxReussite();

        return [
            'total_etudiants' => [
                'valeur' => $totalEtudiants,
                'variation' => 0,
            ],
            'etudiants_actifs' => [
                'valeur' => $etudiantsActifs,
                'variation' => 0,
            ],
            'formations_en_cours' => [
                'valeur' => $formationsEnCours,
                'variation' => 0,
            ],
            'inscriptions_periode' => [
                'valeur' => $inscriptionsPeriode,
                'precedent' => $inscriptionsPeriodePrecedente,
                'variation' => $this->calculerVariation($inscriptionsPeriode, $inscriptionsPeriodePrecedente),
            ],
            'chiffre_affaires' => [
                'valeur' => round($caPeriode, 2),
                'precedent' => round($caPeriodePrecedente, 2),
                'variation' => $this->calculerVariation($caPeriode, $caPeriodePrecedente),
            ],
            'taux_remplissage_moyen' => [
                'valeur' => $tauxRemplissageMoyen,
                'variation' => 0,
            ],
            'taux_reussite' => [
                'valeur' => $tauxReussite,
                'variation' => 0,
            ],
            'periode' => [
                'de' => $de->toDateString(),
                'a' => $a->toDateString(),
            ],
        ];
    }

    /**
     * Agrégat complet pour le tableau de bord (une seule requête HTTP).
     */
    public function tableauDeBord(?string $de = null, ?string $a = null, int $mois = 12): array
    {
        return [
            'kpis' => $this->kpis($de, $a),
            'evolution_inscriptions' => $this->evolutionInscriptions($mois),
            'repartition_statuts' => $this->repartitionStatuts(),
            'repartition_sexes' => $this->repartitionSexes(),
            'revenus_mensuels' => $this->revenusMensuels($mois),
            'top_formations' => $this->topFormations(5),
            'formations_bientot_completes' => $this->formationsBientotCompletes(70),
            'dernieres_inscriptions' => $this->dernieresInscriptions(6),
            'paiements_recents' => $this->paiementsRecents(6),
        ];
    }

    /**
     * Évolution mensuelle des inscriptions sur N mois.
     */
    public function evolutionInscriptions(int $mois = 12): array
    {
        $donnees = Inscription::select(
            DB::raw($this->expressionMois('date_inscription').' as mois'),
            DB::raw('COUNT(*) as total')
        )
            ->where('date_inscription', '>=', now()->subMonths($mois)->startOfMonth())
            ->groupBy('mois')
            ->orderBy('mois')
            ->pluck('total', 'mois');

        $resultat = [];
        for ($i = $mois - 1; $i >= 0; $i--) {
            $cle = now()->subMonths($i)->format('Y-m');
            $resultat[] = [
                'mois' => $cle,
                'total' => $donnees[$cle] ?? 0,
            ];
        }

        return $resultat;
    }

    /**
     * Répartition des étudiants par statut.
     */
    public function repartitionStatuts(): array
    {
        return Etudiant::select('statut', DB::raw('COUNT(*) as total'))
            ->groupBy('statut')
            ->pluck('total', 'statut')
            ->map(fn ($total, $statut) => [
                'nom' => $this->libelleStatutEtudiant($statut),
                'valeur' => $total,
                'cle' => $statut,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Répartition des étudiants par sexe.
     */
    public function repartitionSexes(): array
    {
        return Etudiant::select('sexe', DB::raw('COUNT(*) as total'))
            ->groupBy('sexe')
            ->pluck('total', 'sexe')
            ->map(fn ($total, $sexe) => [
                'nom' => $sexe === 'M' ? 'Hommes' : 'Femmes',
                'valeur' => $total,
                'cle' => $sexe,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Répartition des étudiants par tranche d'âge.
     */
    public function repartitionTranchesAge(): array
    {
        $tranches = [
            ['-18 ans', 0, 17],
            ['18-24 ans', 18, 24],
            ['25-34 ans', 25, 34],
            ['35-44 ans', 35, 44],
            ['45+ ans', 45, 200],
        ];

        $ages = Etudiant::pluck('date_naissance')
            ->filter()
            ->map(fn ($date) => $date->age)
            ->values();

        $resultat = [];
        foreach ($tranches as [$libelle, $min, $max]) {
            $total = $ages->filter(fn ($age) => $age >= $min && $age <= $max)->count();
            $resultat[] = [
                'nom' => $libelle,
                'valeur' => $total,
            ];
        }

        return $resultat;
    }

    /**
     * Top formations les plus demandées.
     */
    public function topFormations(int $limite = 5): array
    {
        return Formation::withCount(['inscriptions as inscriptions_total'])
            ->orderByDesc('inscriptions_total')
            ->limit($limite)
            ->get()
            ->map(fn ($formation) => [
                'id' => $formation->id,
                'code' => $formation->code,
                'intitule' => $formation->intitule,
                'total' => $formation->inscriptions_total,
            ])
            ->toArray();
    }

    /**
     * Inscriptions par formation (barres horizontales).
     */
    public function inscriptionsParFormation(): array
    {
        return Formation::withCount(['inscriptions as inscriptions_total'])
            ->orderByDesc('inscriptions_total')
            ->get()
            ->map(fn ($formation) => [
                'nom' => $formation->intitule,
                'total' => $formation->inscriptions_total,
            ])
            ->toArray();
    }

    /**
     * Répartition des formations par catégorie.
     */
    public function repartitionCategories(): array
    {
        return \App\Models\CategorieFormation::withCount('formations')
            ->get()
            ->map(fn ($categorie) => [
                'nom' => $categorie->nom,
                'valeur' => $categorie->formations_count,
                'couleur' => $categorie->couleur,
            ])
            ->toArray();
    }

    /**
     * Revenus mensuels sur N mois.
     */
    public function revenusMensuels(int $mois = 12): array
    {
        $donnees = Paiement::select(
            DB::raw($this->expressionMois('date_paiement').' as mois'),
            DB::raw('SUM(montant) as total')
        )
            ->where('date_paiement', '>=', now()->subMonths($mois)->startOfMonth())
            ->groupBy('mois')
            ->orderBy('mois')
            ->pluck('total', 'mois');

        $resultat = [];
        for ($i = $mois - 1; $i >= 0; $i--) {
            $cle = now()->subMonths($i)->format('Y-m');
            $resultat[] = [
                'mois' => $cle,
                'total' => round((float) ($donnees[$cle] ?? 0), 2),
            ];
        }

        return $resultat;
    }

    /**
     * Taux de remplissage par formation.
     */
    public function remplissageFormations(): array
    {
        return Formation::withCount('inscriptions')
            ->get()
            ->map(fn ($formation) => [
                'id' => $formation->id,
                'code' => $formation->code,
                'intitule' => $formation->intitule,
                'capacite_max' => $formation->capacite_max,
                'inscrits' => $formation->inscriptions_count,
                'pourcentage' => $formation->capacite_max > 0
                    ? round(($formation->inscriptions_count / $formation->capacite_max) * 100, 2)
                    : 0,
            ])
            ->toArray();
    }

    /**
     * Formations bientôt complètes (>= 80% de remplissage).
     */
    public function formationsBientotCompletes(float $seuil = 80.0): array
    {
        return collect($this->remplissageFormations())
            ->filter(fn ($f) => $f['pourcentage'] >= $seuil)
            ->sortByDesc('pourcentage')
            ->values()
            ->toArray();
    }

    /**
     * Dernières inscriptions.
     */
    public function dernieresInscriptions(int $limite = 5): array
    {
        return Inscription::with(['etudiant', 'formation'])
            ->orderByDesc('date_inscription')
            ->limit($limite)
            ->get()
            ->map(fn ($inscription) => [
                'id' => $inscription->id,
                'date_inscription' => $inscription->date_inscription?->toDateString(),
                'statut' => $inscription->statut,
                'etudiant' => $inscription->etudiant ? "{$inscription->etudiant->prenom} {$inscription->etudiant->nom}" : null,
                'formation' => $inscription->formation?->intitule,
            ])
            ->toArray();
    }

    /**
     * Paiements récents.
     */
    public function paiementsRecents(int $limite = 5): array
    {
        return Paiement::with(['inscription.etudiant', 'inscription.formation'])
            ->orderByDesc('date_paiement')
            ->limit($limite)
            ->get()
            ->map(fn ($paiement) => [
                'id' => $paiement->id,
                'montant' => $paiement->montant,
                'mode' => $paiement->mode,
                'date_paiement' => $paiement->date_paiement?->toDateString(),
                'etudiant' => $paiement->inscription?->etudiant
                    ? "{$paiement->inscription->etudiant->prenom} {$paiement->inscription->etudiant->nom}"
                    : null,
                'formation' => $paiement->inscription?->formation?->intitule,
            ])
            ->toArray();
    }

    private function expressionMois(string $colonne): string
    {
        $driver = DB::connection()->getDriverName();

        return match ($driver) {
            'sqlite' => "strftime('%Y-%m', {$colonne})",
            'pgsql' => "TO_CHAR({$colonne}, 'YYYY-MM')",
            default => "DATE_FORMAT({$colonne}, '%Y-%m')",
        };
    }

    private function tauxRemplissageMoyen(): float
    {
        $formations = Formation::withCount('inscriptions')->get();

        if ($formations->isEmpty()) {
            return 0.0;
        }

        $moyenne = $formations->avg(fn ($formation) => $formation->capacite_max > 0
            ? ($formation->inscriptions_count / $formation->capacite_max) * 100
            : 0);

        return round($moyenne, 2);
    }

    private function tauxReussite(): float
    {
        $totalTerminees = Inscription::where('statut', 'terminee')->count();

        if ($totalTerminees === 0) {
            return 0.0;
        }

        $reussites = Inscription::where('statut', 'terminee')
            ->where('note_finale', '>=', 10)
            ->count();

        return round(($reussites / $totalTerminees) * 100, 2);
    }

    private function calculerVariation(float $actuel, float $precedent): float
    {
        if ($precedent == 0) {
            return $actuel > 0 ? 100.0 : 0.0;
        }

        return round((($actuel - $precedent) / $precedent) * 100, 2);
    }

    private function libelleStatutEtudiant(string $statut): string
    {
        return match ($statut) {
            'actif' => 'Actif',
            'suspendu' => 'Suspendu',
            'diplome' => 'Diplômé',
            'abandon' => 'Abandon',
            default => ucfirst($statut),
        };
    }
}
