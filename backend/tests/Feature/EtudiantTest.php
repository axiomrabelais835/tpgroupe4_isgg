<?php

namespace Tests\Feature;

use App\Models\Etudiant;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EtudiantTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        parent::setUp();
        $this->utilisateur = Utilisateur::factory()->create();
    }

    public function test_liste_etudiants(): void
    {
        Etudiant::factory(3)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/etudiants');

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_creation_etudiant(): void
    {
        $donnees = Etudiant::factory()->make()->toArray();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/etudiants', $donnees);

        $reponse
            ->assertStatus(201)
            ->assertJsonStructure(['message', 'etudiant' => ['id', 'matricule', 'nom', 'prenom']]);

        $this->assertDatabaseHas('etudiants', ['email' => $donnees['email']]);
    }

    public function test_creation_etudiant_avec_matricule_auto_genere(): void
    {
        $donnees = Etudiant::factory()->make()->toArray();
        unset($donnees['matricule']);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/etudiants', $donnees);

        $reponse->assertStatus(201);
        $this->assertStringStartsWith('ETU-', $reponse->json('etudiant.matricule'));
    }

    public function test_creation_etudiant_avec_erreurs_validation(): void
    {
        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->postJson('/api/v1/etudiants', []);

        $reponse
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'erreurs']);
    }

    public function test_maj_etudiant(): void
    {
        $etudiant = Etudiant::factory()->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/etudiants/{$etudiant->id}", [
                'nom' => 'Nouveau Nom',
                'prenom' => $etudiant->prenom,
                'sexe' => $etudiant->sexe,
                'date_naissance' => $etudiant->date_naissance->toDateString(),
                'email' => $etudiant->email,
                'date_inscription' => $etudiant->date_inscription->toDateString(),
            ]);

        $reponse->assertStatus(200);
        $this->assertDatabaseHas('etudiants', ['id' => $etudiant->id, 'nom' => 'Nouveau Nom']);
    }

    public function test_suppression_etudiant(): void
    {
        $etudiant = Etudiant::factory()->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->deleteJson("/api/v1/etudiants/{$etudiant->id}");

        $reponse->assertStatus(200);
        $this->assertSoftDeleted('etudiants', ['id' => $etudiant->id]);
    }

    public function test_recherche_etudiant(): void
    {
        $etudiant = Etudiant::factory()->create(['nom' => 'Dupont']);
        Etudiant::factory()->create(['nom' => 'Martin']);

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->getJson('/api/v1/etudiants?search=Dupont');

        $reponse->assertStatus(200);
        $this->assertCount(1, $reponse->json('data'));
    }

    public function test_upload_photo(): void
    {
        Storage::fake('public');
        $etudiant = Etudiant::factory()->create();

        $photo = UploadedFile::fake()->create('photo.jpg', 512, 'image/jpeg');

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->putJson("/api/v1/etudiants/{$etudiant->id}", [
                'nom' => $etudiant->nom,
                'prenom' => $etudiant->prenom,
                'sexe' => $etudiant->sexe,
                'date_naissance' => $etudiant->date_naissance->toDateString(),
                'email' => $etudiant->email,
                'date_inscription' => $etudiant->date_inscription->toDateString(),
                'photo' => $photo,
            ]);

        $reponse->assertStatus(200);
        $this->assertNotNull($etudiant->fresh()->photo);
    }

    public function test_export_csv(): void
    {
        Etudiant::factory(5)->create();

        $reponse = $this->actingAs($this->utilisateur, 'sanctum')
            ->get('/api/v1/etudiants-export/csv');

        $reponse->assertStatus(200);
        $this->assertStringContainsString('text/csv', $reponse->headers->get('Content-Type'));
    }
}
