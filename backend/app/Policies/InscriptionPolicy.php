<?php

namespace App\Policies;

use App\Models\Utilisateur;

class InscriptionPolicy
{
    public function viewAny(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function view(Utilisateur $utilisateur, $inscription): bool
    {
        return true;
    }

    public function create(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function update(Utilisateur $utilisateur, $inscription): bool
    {
        return true;
    }

    public function delete(Utilisateur $utilisateur, $inscription): bool
    {
        return true;
    }
}
