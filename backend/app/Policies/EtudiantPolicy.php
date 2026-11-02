<?php

namespace App\Policies;

use App\Models\Utilisateur;

class EtudiantPolicy
{
    public function viewAny(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function view(Utilisateur $utilisateur, $etudiant): bool
    {
        return true;
    }

    public function create(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function update(Utilisateur $utilisateur, $etudiant): bool
    {
        return true;
    }

    public function delete(Utilisateur $utilisateur, $etudiant): bool
    {
        return true;
    }

    public function export(Utilisateur $utilisateur): bool
    {
        return true;
    }
}
