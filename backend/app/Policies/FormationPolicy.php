<?php

namespace App\Policies;

use App\Models\Utilisateur;

class FormationPolicy
{
    public function viewAny(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function view(Utilisateur $utilisateur, $formation): bool
    {
        return true;
    }

    public function create(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function update(Utilisateur $utilisateur, $formation): bool
    {
        return true;
    }

    public function delete(Utilisateur $utilisateur, $formation): bool
    {
        return true;
    }
}
