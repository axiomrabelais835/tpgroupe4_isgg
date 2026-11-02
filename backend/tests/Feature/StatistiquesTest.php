<?php

namespace Tests\Feature;

use App\Models\CategorieFormation;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatistiquesTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    public function test_kpis(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        $etudiant = Etudiant::factory()->create(['statut' => 'actif']);

        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);

        Paiement::create([
            'inscription_id' => $inscription->id,
            'montant' => 100,
            'mode' => 'especes',
            'date_paiement' => now(),
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/kpis');

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure([
                'total_etudiants',
                'etudiants_actifs',
                'formations_en_cours',
                'inscriptions_periode',
                'chiffre_affaires',
                'taux_remplissage_moyen',
                'taux_reussite',
                'periode',
            ]);
    }

    public function test_evolution_inscriptions(): void
    {
        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/evolution-inscriptions?mois=3');

        $reponse->assertStatus(200);
        $this->assertCount(3, $reponse->json());
    }

    public function test_repartition_statuts(): void
    {
        Etudiant::factory(5)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/repartition-statuts');

        $reponse->assertStatus(200);
    }

    public function test_remplissage_formations(): void
    {
        $categorie = CategorieFormation::factory()->create();
        Formation::factory()->create([
            'categorie_formation_id' => $categorie->id,
            'capacite_max' => 20,
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/remplissage-formations');

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'code', 'intitule', 'capacite_max', 'inscrits', 'pourcentage'],
            ]);
    }

    public function test_revenus_mensuels(): void
    {
        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/revenus-mensuels?mois=6');

        $reponse->assertStatus(200);
        $this->assertCount(6, $reponse->json());
    }

    public function test_tableau_de_bord_agrege(): void
    {
        $categorie = CategorieFormation::factory()->create();
        Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        Etudiant::factory(3)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/statistiques/tableau-de-bord?mois=6');

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure([
                'kpis' => ['total_etudiants', 'inscriptions_periode', 'chiffre_affaires'],
                'evolution_inscriptions',
                'repartition_statuts',
                'repartition_sexes',
                'revenus_mensuels',
                'top_formations',
                'formations_bientot_completes',
                'dernieres_inscriptions',
                'paiements_recents',
            ]);

        $this->assertCount(6, $reponse->json('evolution_inscriptions'));
    }
}
