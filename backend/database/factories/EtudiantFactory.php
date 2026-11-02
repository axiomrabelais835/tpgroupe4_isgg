<?php

namespace Database\Factories;

use App\Models\Etudiant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Etudiant>
 */
class EtudiantFactory extends Factory
{
    protected $model = Etudiant::class;

    public function definition(): array
    {
        $sexe = fake()->randomElement(['M', 'F']);

        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName($sexe === 'M' ? 'male' : 'female'),
            'sexe' => $sexe,
            'date_naissance' => fake()->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
            'lieu_naissance' => fake()->city(),
            'email' => fake()->unique()->safeEmail(),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->streetAddress(),
            'ville' => fake()->city(),
            'pays' => fake()->country(),
            'photo' => null,
            'statut' => fake()->randomElement(['actif', 'suspendu', 'diplome', 'abandon']),
            'date_inscription' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }
}
