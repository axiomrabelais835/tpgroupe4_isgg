<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formation extends Model
{
    use HasFactory, SoftDeletes, \App\Traits\Filtrable;

    protected $table = 'formations';

    protected $fillable = [
        'categorie_formation_id',
        'code',
        'intitule',
        'description',
        'duree_heures',
        'prix',
        'niveau',
        'capacite_max',
        'date_debut',
        'date_fin',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'date_debut' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieFormation::class, 'categorie_formation_id');
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class, 'formation_id');
    }

    /**
     * Recherche multicritère (code, intitulé, description).
     */
    public function scopeRecherche(Builder $query, ?string $terme): Builder
    {
        if (!$terme) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($terme) {
            $q->where('code', 'like', "%{$terme}%")
                ->orWhere('intitule', 'like', "%{$terme}%")
                ->orWhere('description', 'like', "%{$terme}%");
        });
    }

    /**
     * Filtres avancés (statut, niveau, catégorie, plage de dates de début).
     */
    public function scopeFiltres(Builder $query, array $filtres): Builder
    {
        if (!empty($filtres['statut'])) {
            $query->whereIn('statut', (array) $filtres['statut']);
        }

        if (!empty($filtres['niveau'])) {
            $query->whereIn('niveau', (array) $filtres['niveau']);
        }

        if (!empty($filtres['categorie_formation_id'])) {
            $query->whereIn('categorie_formation_id', (array) $filtres['categorie_formation_id']);
        }

        $query->plageDates('date_debut', $filtres['debut_de'] ?? null, $filtres['debut_a'] ?? null);

        return $query;
    }
}
