<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscription extends Model
{
    use HasFactory, \App\Traits\Filtrable;

    protected $table = 'inscriptions';

    protected $fillable = [
        'etudiant_id',
        'formation_id',
        'date_inscription',
        'statut',
        'note_finale',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_inscription' => 'date',
            'note_finale' => 'decimal:2',
        ];
    }

    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class, 'etudiant_id');
    }

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'formation_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'inscription_id');
    }

    /**
     * Recherche multicritère via étudiant (nom/prénom/matricule) et formation (code/intitulé).
     */
    public function scopeRecherche(Builder $query, ?string $terme): Builder
    {
        if (!$terme) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($terme) {
            $q->whereHas('etudiant', function (Builder $eq) use ($terme) {
                $eq->where('nom', 'like', "%{$terme}%")
                    ->orWhere('prenom', 'like', "%{$terme}%")
                    ->orWhere('matricule', 'like', "%{$terme}%");
            })->orWhereHas('formation', function (Builder $fq) use ($terme) {
                $fq->where('code', 'like', "%{$terme}%")
                    ->orWhere('intitule', 'like', "%{$terme}%");
            });
        });
    }

    /**
     * Filtres avancés (statut, étudiant, formation, plage de dates).
     */
    public function scopeFiltres(Builder $query, array $filtres): Builder
    {
        if (!empty($filtres['statut'])) {
            $query->whereIn('statut', (array) $filtres['statut']);
        }

        if (!empty($filtres['etudiant_id'])) {
            $query->whereIn('etudiant_id', (array) $filtres['etudiant_id']);
        }

        if (!empty($filtres['formation_id'])) {
            $query->whereIn('formation_id', (array) $filtres['formation_id']);
        }

        $query->plageDates('date_inscription', $filtres['inscription_de'] ?? null, $filtres['inscription_a'] ?? null);

        return $query;
    }
}
