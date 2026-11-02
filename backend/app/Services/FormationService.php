<?php

namespace App\Services;

use App\Models\Formation;
use App\Models\Inscription;
use Illuminate\Validation\ValidationException;

class FormationService
{
    /**
     * Vérifie qu'une formation peut être supprimée (pas d'inscriptions actives).
     *
     * @throws ValidationException
     */
    public function verifierSuppression(Formation $formation): void
    {
        $inscriptionsActives = Inscription::where('formation_id', $formation->id)
            ->whereIn('statut', ['en_attente', 'validee'])
            ->count();

        if ($inscriptionsActives > 0) {
            throw ValidationException::withMessages([
                'formation' => 'Impossible de supprimer cette formation : elle compte des inscriptions actives.',
            ]);
        }
    }
}
