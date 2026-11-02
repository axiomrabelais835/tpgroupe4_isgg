<?php

namespace App\Services;

use App\Models\Formation;
use App\Models\Inscription;
use Illuminate\Validation\ValidationException;

class InscriptionService
{
    /**
     * Vérifie la capacité maximale d'une formation avant validation d'une inscription.
     *
     * @throws ValidationException
     */
    public function verifierCapacite(Formation $formation, ?int $exclureInscriptionId = null): void
    {
        $inscritsActifs = Inscription::where('formation_id', $formation->id)
            ->whereIn('statut', ['en_attente', 'validee'])
            ->when($exclureInscriptionId, fn ($q) => $q->where('id', '!=', $exclureInscriptionId))
            ->count();

        if ($inscritsActifs >= $formation->capacite_max) {
            throw ValidationException::withMessages([
                'formation_id' => 'La capacité maximale de cette formation est déjà atteinte.',
            ]);
        }
    }

    /**
     * Vérifie qu'une inscription n'existe pas déjà (etudiant_id, formation_id).
     *
     * @throws ValidationException
     */
    public function verifierDoublon(int $etudiantId, int $formationId, ?int $exclureId = null): void
    {
        $existe = Inscription::where('etudiant_id', $etudiantId)
            ->where('formation_id', $formationId)
            ->when($exclureId, fn ($q) => $q->where('id', '!=', $exclureId))
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages([
                'etudiant_id' => 'Cet étudiant est déjà inscrit à cette formation.',
            ]);
        }
    }
}
