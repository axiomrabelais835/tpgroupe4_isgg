<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategorieFormation extends Model
{
    use HasFactory, \App\Traits\Filtrable;

    protected $table = 'categories_formations';

    protected $fillable = [
        'nom',
        'description',
        'couleur',
    ];

    public function formations(): HasMany
    {
        return $this->hasMany(Formation::class, 'categorie_formation_id');
    }

    /**
     * Recherche multicritère (nom, description).
     */
    public function scopeRecherche(Builder $query, ?string $terme): Builder
    {
        if (!$terme) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($terme) {
            $q->where('nom', 'like', "%{$terme}%")
                ->orWhere('description', 'like', "%{$terme}%");
        });
    }
}
