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

class PaiementTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    private function creerInscription(): Inscription
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        $etudiant = Etudiant::factory()->create();

        return Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);
    }

    public function test_liste_paiements(): void
    {
        $inscription = $this->creerInscription();

        Paiement::create([
            'inscription_id' => $inscription->id,
            'montant' => 100,
            'mode' => 'especes',
            'date_paiement' => now(),
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/paiements');

        $reponse->assertStatus(200);
    }

    public function test_creation_paiement(): void
    {
        $inscription = $this->creerInscription();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/paiements', [
                'inscription_id' => $inscription->id,
                'montant' => 150,
                'mode' => 'mobile_money',
                'date_paiement' => now()->toDateString(),
            ]);

        $reponse->assertStatus(201);
        $this->assertDatabaseHas('paiements', ['inscription_id' => $inscription->id, 'montant' => 150]);
    }

    public function test_creation_paiement_avec_erreur_validation(): void
    {
        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/paiements', []);

        $reponse->assertStatus(422);
    }

    public function test_maj_paiement(): void
    {
        $inscription = $this->creerInscription();
        $paiement = Paiement::create([
            'inscription_id' => $inscription->id,
            'montant' => 100,
            'mode' => 'especes',
            'date_paiement' => now(),
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/paiements/{$paiement->id}", [
                'inscription_id' => $inscription->id,
                'montant' => 250,
                'mode' => 'virement',
                'date_paiement' => now()->toDateString(),
            ]);

        $reponse->assertStatus(200);
        $this->assertDatabaseHas('paiements', ['id' => $paiement->id, 'montant' => 250]);
    }

    public function test_suppression_paiement(): void
    {
        $inscription = $this->creerInscription();
        $paiement = Paiement::create([
            'inscription_id' => $inscription->id,
            'montant' => 100,
            'mode' => 'especes',
            'date_paiement' => now(),
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/paiements/{$paiement->id}");

        $reponse->assertStatus(200);
        $this->assertDatabaseMissing('paiements', ['id' => $paiement->id]);
    }
}
