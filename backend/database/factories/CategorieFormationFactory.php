<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CategorieFormation>
 */
class CategorieFormationFactory extends Factory
{
    protected $model = \App\Models\CategorieFormation::class;

    public function definition(): array
    {
        return [
            'nom' => fake()->unique()->randomElement([
                'Développement Web',
                'Data Science',
                'Design UX/UI',
                'Cybersécurité',
                'Gestion de Projet',
                'Marketing Digital',
            ]),
            'description' => fake()->sentence(),
            'couleur' => fake()->hexColor(),
        ];
    }
}
