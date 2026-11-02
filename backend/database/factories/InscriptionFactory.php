<?php

namespace Database\Factories;

use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inscription>
 */
class InscriptionFactory extends Factory
{
    protected $model = Inscription::class;

    public function definition(): array
    {
        return [
            'etudiant_id' => Etudiant::factory(),
            'formation_id' => Formation::factory(),
            'date_inscription' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'statut' => fake()->randomElement(['en_attente', 'validee', 'annulee', 'terminee']),
            'note_finale' => fake()->randomElement([null, fake()->randomFloat(2, 0, 20)]),
            'observations' => fake()->sentence(),
        ];
    }
}
