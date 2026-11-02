<?php

namespace Tests\Feature;

use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_connexion_avec_identifiants_valides(): void
    {
        $utilisateur = Utilisateur::factory()->create([
            'email' => 'test@example.com',
            'mot_de_passe' => 'password',
        ]);

        $reponse = $this->postJson('/api/v1/auth/connexion', [
            'email' => 'test@example.com',
            'mot_de_passe' => 'password',
        ]);

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure(['message', 'utilisateur', 'token']);
    }

    public function test_connexion_avec_identifiants_invalides(): void
    {
        Utilisateur::factory()->create([
            'email' => 'test@example.com',
            'mot_de_passe' => 'password',
        ]);

        $reponse = $this->postJson('/api/v1/auth/connexion', [
            'email' => 'test@example.com',
            'mot_de_passe' => 'mauvais',
        ]);

        $reponse->assertStatus(401);
    }

    public function test_utilisateur_connecte_recherche(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur, 'sanctum')
            ->getJson('/api/v1/auth/utilisateur');

        $reponse
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['id', 'nom', 'email', 'role']]);
    }

    public function test_deconnexion(): void
    {
        $utilisateur = Utilisateur::factory()->create();

        $reponse = $this->actingAs($utilisateur, 'sanctum')
            ->postJson('/api/v1/auth/deconnexion');

        $reponse->assertStatus(200);
    }

    public function test_route_protegee_retourne_401_sans_token(): void
    {
        $reponse = $this->getJson('/api/v1/etudiants');

        $reponse->assertStatus(401);
    }
}
