<?php

namespace App\Policies;

use App\Models\Utilisateur;

class CategorieFormationPolicy
{
    public function viewAny(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function view(Utilisateur $utilisateur, $categorie): bool
    {
        return true;
    }

    public function create(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function update(Utilisateur $utilisateur, $categorie): bool
    {
        return true;
    }

    public function delete(Utilisateur $utilisateur, $categorie): bool
    {
        return true;
    }
}
