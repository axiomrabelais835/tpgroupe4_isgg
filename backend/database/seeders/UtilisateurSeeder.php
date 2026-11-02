<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::create([
            'nom' => 'Rabelais Boss',
            'email' => 'rabelaisallomavo@gmail.com',
            'mot_de_passe' => Hash::make('Rabelais835@'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        
    }
}
