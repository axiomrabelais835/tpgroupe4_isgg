<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Scopes réutilisables pour la recherche multicritère, le tri et les filtres.
 */
trait Filtrable
{
    /**
     * Tri sécurisé via whiteliste de colonnes autorisées.
     */
    public function scopeTriePar(Builder $query, ?string $sort, ?string $direction, array $whitelist): Builder
    {
        if ($sort && in_array($sort, $whitelist, true)) {
            $direction = in_array(strtolower($direction ?? 'asc'), ['asc', 'desc'], true) ? $direction : 'asc';
            $query->orderBy($sort, $direction);
        }

        return $query;
    }

    /**
     * Filtre par plage de dates sur une colonne donnée.
     */
    public function scopePlageDates(Builder $query, ?string $colonne, ?string $de, ?string $a): Builder
    {
        if ($colonne && $de) {
            $query->whereDate($colonne, '>=', $de);
        }
        if ($colonne && $a) {
            $query->whereDate($colonne, '<=', $a);
        }

        return $query;
    }
}
