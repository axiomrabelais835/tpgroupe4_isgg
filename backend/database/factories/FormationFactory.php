<?php

namespace Database\Factories;

use App\Models\CategorieFormation;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Formation>
 */
class FormationFactory extends Factory
{
    protected $model = Formation::class;

    public function definition(): array
    {
        $dateDebut = fake()->dateTimeBetween('-6 months', '+6 months');
        $duree = fake()->numberBetween(10, 60);

        return [
            'categorie_formation_id' => CategorieFormation::factory(),
            'code' => strtoupper(fake()->unique()->bothify('???-####')),
            'intitule' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'duree_heures' => $duree,
            'prix' => fake()->randomFloat(2, 100, 5000),
            'niveau' => fake()->randomElement(['debutant', 'intermediaire', 'avance']),
            'capacite_max' => fake()->numberBetween(10, 40),
            'date_debut' => $dateDebut->format('Y-m-d'),
            'date_fin' => (clone $dateDebut)->modify("+{$duree} days")->format('Y-m-d'),
            'statut' => fake()->randomElement(['planifiee', 'en_cours', 'terminee', 'annulee']),
        ];
    }
}
