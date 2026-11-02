<?php

namespace Tests\Feature;

use App\Models\CategorieFormation;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormationTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    public function test_liste_formations(): void
    {
        CategorieFormation::factory()->create();
        Formation::factory(3)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/formations');

        $reponse->assertStatus(200);
    }

    public function test_creation_formation(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $donnees = Formation::factory()->make([
            'categorie_formation_id' => $categorie->id,
        ])->toArray();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/formations', $donnees);

        $reponse->assertStatus(201);
        $this->assertDatabaseHas('formations', ['code' => $donnees['code']]);
    }

    public function test_maj_formation(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/formations/{$formation->id}", [
                'categorie_formation_id' => $categorie->id,
                'code' => $formation->code,
                'intitule' => 'Intitulé mis à jour',
                'duree_heures' => 40,
                'prix' => 100,
                'niveau' => 'debutant',
                'capacite_max' => 20,
                'date_debut' => $formation->date_debut->toDateString(),
            ]);

        $reponse->assertStatus(200);
        $this->assertDatabaseHas('formations', ['id' => $formation->id, 'intitule' => 'Intitulé mis à jour']);
    }

    public function test_suppression_formation_sans_inscription(): void
    {
        $categorie = CategorieFormation::factory()->create();
        $formation = Formation::factory()->create(['categorie_formation_id' => $categorie->id]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/formations/{$formation->id}");

        $reponse->assertStatus(200);
        $this->assertSoftDeleted('formations', ['id' => $formation->id]);
    }

    public function test_suppression_formation_bloquee_si_inscriptions_actives(): void
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
            ->deleteJson("/api/v1/formations/{$formation->id}");

        $reponse->assertStatus(422);
        $this->assertDatabaseHas('formations', ['id' => $formation->id, 'deleted_at' => null]);
    }
}
