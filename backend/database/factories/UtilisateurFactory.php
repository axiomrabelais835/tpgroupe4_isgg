<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Utilisateur>
 */
class UtilisateurFactory extends Factory
{
    protected $model = \App\Models\Utilisateur::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'mot_de_passe' => Hash::make('password'),
            'role' => fake()->randomElement(['admin', 'gestionnaire']),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }
}
