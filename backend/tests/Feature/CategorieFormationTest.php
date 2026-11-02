<?php

namespace Tests\Feature;

use App\Models\CategorieFormation;
use App\Models\Formation;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategorieFormationTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    public function test_liste_categories(): void
    {
        CategorieFormation::factory(3)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/categories');

        $reponse->assertStatus(200);
    }

    public function test_creation_categorie(): void
    {
        $donnees = CategorieFormation::factory()->make()->toArray();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/categories', $donnees);

        $reponse->assertStatus(201);
        $this->assertDatabaseHas('categories_formations', ['nom' => $donnees['nom']]);
    }

    public function test_maj_categorie(): void
    {
        $categorie = CategorieFormation::factory()->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/categories/{$categorie->id}", [
                'nom' => 'Nouvelle Catégorie',
                'description' => 'Description mise à jour',
                'couleur' => '#123456',
            ]);

        $reponse->assertStatus(200);
        $this->assertDatabaseHas('categories_formations', ['id' => $categorie->id, 'nom' => 'Nouvelle Catégorie']);
    }

    public function test_suppression_categorie(): void
    {
        $categorie = CategorieFormation::factory()->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/categories/{$categorie->id}");

        $reponse->assertStatus(200);
        $this->assertDatabaseMissing('categories_formations', ['id' => $categorie->id]);
    }

    public function test_nom_unique(): void
    {
        CategorieFormation::factory()->create(['nom' => 'Existe Déjà']);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/categories', [
                'nom' => 'Existe Déjà',
                'description' => 'Test',
                'couleur' => '#000000',
            ]);

        $reponse->assertStatus(422);
    }

    public function test_suppression_categorie_avec_formations_refusee(): void
    {
        $categorie = CategorieFormation::factory()->create();
        Formation::factory()->create(['categorie_formation_id' => $categorie->id]);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/categories/{$categorie->id}");

        $reponse->assertStatus(422);
        $this->assertDatabaseHas('categories_formations', ['id' => $categorie->id]);
    }
}
