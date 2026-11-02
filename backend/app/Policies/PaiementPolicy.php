<?php

namespace App\Policies;

use App\Models\Utilisateur;

class PaiementPolicy
{
    public function viewAny(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function view(Utilisateur $utilisateur, $paiement): bool
    {
        return true;
    }

    public function create(Utilisateur $utilisateur): bool
    {
        return true;
    }

    public function update(Utilisateur $utilisateur, $paiement): bool
    {
        return true;
    }

    public function delete(Utilisateur $utilisateur, $paiement): bool
    {
        return true;
    }
}
