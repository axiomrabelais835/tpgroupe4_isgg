<?php

namespace Database\Factories;

use App\Models\Inscription;
use App\Models\Paiement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Paiement>
 */
class PaiementFactory extends Factory
{
    protected $model = Paiement::class;

    public function definition(): array
    {
        return [
            'inscription_id' => Inscription::factory(),
            'montant' => fake()->randomFloat(2, 50, 3000),
            'mode' => fake()->randomElement(['especes', 'mobile_money', 'virement', 'carte']),
            'reference' => strtoupper(fake()->bothify('REF-########')),
            'date_paiement' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
        ];
    }
}
