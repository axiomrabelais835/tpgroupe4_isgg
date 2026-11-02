<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory, \App\Traits\Filtrable;

    protected $table = 'paiements';

    protected $fillable = [
        'inscription_id',
        'montant',
        'mode',
        'reference',
        'date_paiement',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'decimal:2',
            'date_paiement' => 'date',
        ];
    }

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class, 'inscription_id');
    }

    /**
     * Recherche multicritère (référence, via étudiant lié).
     */
    public function scopeRecherche(Builder $query, ?string $terme): Builder
    {
        if (!$terme) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($terme) {
            $q->where('reference', 'like', "%{$terme}%")
                ->orWhereHas('inscription.etudiant', function (Builder $eq) use ($terme) {
                    $eq->where('nom', 'like', "%{$terme}%")
                        ->orWhere('prenom', 'like', "%{$terme}%");
                });
        });
    }

    /**
     * Filtres avancés (mode, inscription, plage de dates).
     */
    public function scopeFiltres(Builder $query, array $filtres): Builder
    {
        if (!empty($filtres['mode'])) {
            $query->whereIn('mode', (array) $filtres['mode']);
        }

        if (!empty($filtres['inscription_id'])) {
            $query->whereIn('inscription_id', (array) $filtres['inscription_id']);
        }

        if (!empty($filtres['formation_id'])) {
            $query->whereHas('inscription', function (Builder $q) use ($filtres) {
                $q->whereIn('formation_id', (array) $filtres['formation_id']);
            });
        }

        if (!empty($filtres['etudiant_id'])) {
            $query->whereHas('inscription', function (Builder $q) use ($filtres) {
                $q->whereIn('etudiant_id', (array) $filtres['etudiant_id']);
            });
        }

        $query->plageDates('date_paiement', $filtres['paiement_de'] ?? null, $filtres['paiement_a'] ?? null);

        return $query;
    }
}
