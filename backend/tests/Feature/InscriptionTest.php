<?php

namespace Tests\Feature;

use App\Models\CategorieFormation;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InscriptionTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    public function test_liste_inscriptions(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        $etudiant = Etudiant::factory()->create();

        Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/inscriptions');

        $reponse->assertStatus(200);
    }

    public function test_creation_inscription(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create([
            'categorie_formation_id' => $categorie->id,
            'capacite_max' => 10,
        ]);
        $etudiant = Etudiant::factory()->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/inscriptions', [
                'etudiant_id' => $etudiant->id,
                'formation_id' => $formation->id,
                'date_inscription' => now()->toDateString(),
                'statut' => 'validee',
            ]);

        $reponse->assertStatus(201);
        $this->assertDatabaseHas('inscriptions', [
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
        ]);
    }

    public function test_inscription_double_refusee(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create([
            'categorie_formation_id' => $categorie->id,
            'capacite_max' => 10,
        ]);
        $etudiant = Etudiant::factory()->create();

        Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/inscriptions', [
                'etudiant_id' => $etudiant->id,
                'formation_id' => $formation->id,
                'date_inscription' => now()->toDateString(),
                'statut' => 'validee',
            ]);

        $reponse->assertStatus(422);
        $this->assertDatabaseCount('inscriptions', 1);
    }

    public function test_inscription_capacite_depassee_refusee(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create([
            'categorie_formation_id' => $categorie->id,
            'capacite_max' => 1,
        ]);
        $etudiant1 = Etudiant::factory()->create();
        $etudiant2 = Etudiant::factory()->create();

        Inscription::create([
            'etudiant_id' => $etudiant1->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'validee',
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/inscriptions', [
                'etudiant_id' => $etudiant2->id,
                'formation_id' => $formation->id,
                'date_inscription' => now()->toDateString(),
                'statut' => 'validee',
            ]);

        $reponse->assertStatus(422);
        $this->assertDatabaseCount('inscriptions', 1);
    }

    public function test_maj_inscription(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        $etudiant = Etudiant::factory()->create();

        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'en_attente',
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/inscriptions/{$inscription->id}", [
                'etudiant_id' => $etudiant->id,
                'formation_id' => $formation->id,
                'date_inscription' => now()->toDateString(),
                'statut' => 'validee',
                'note_finale' => 15,
            ]);

        $reponse->assertStatus(200);
        $this->assertDatabaseHas('inscriptions', ['id' => $inscription->id, 'statut' => 'validee']);
    }

    public function test_suppression_inscription(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);
        $etudiant = Etudiant::factory()->create();

        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => now(),
            'statut' => 'en_attente',
        ]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/inscriptions/{$inscription->id}");

        $reponse->assertStatus(200);
        $this->assertDatabaseMissing('inscriptions', ['id' => $inscription->id]);
    }
}
