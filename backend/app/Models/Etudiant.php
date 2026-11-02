<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Etudiant extends Model
{
    use HasFactory, SoftDeletes, \App\Traits\Filtrable;

    protected $table = 'etudiants';

    protected static function booted(): void
    {
        static::creating(function (Etudiant $etudiant) {
            if (empty($etudiant->matricule)) {
                $annee = now()->year;
                $dernier = static::withTrashed()
                    ->where('matricule', 'like', "ETU-{$annee}-%")
                    ->orderByDesc('matricule')
                    ->first();

                $prochain = $dernier
                    ? ((int) substr($dernier->matricule, -4)) + 1
                    : 1;

                $etudiant->matricule = sprintf('ETU-%s-%04d', $annee, $prochain);
            }
        });
    }

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'sexe',
        'date_naissance',
        'lieu_naissance',
        'email',
        'telephone',
        'adresse',
        'ville',
        'pays',
        'photo',
        'statut',
        'date_inscription',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'date_inscription' => 'date',
        ];
    }

    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class, 'etudiant_id');
    }

    /**
     * Recherche multicritère (nom, prénom, matricule, email, téléphone, ville).
     */
    public function scopeRecherche(Builder $query, ?string $terme): Builder
    {
        if (!$terme) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($terme) {
            $q->where('nom', 'like', "%{$terme}%")
                ->orWhere('prenom', 'like', "%{$terme}%")
                ->orWhere('matricule', 'like', "%{$terme}%")
                ->orWhere('email', 'like', "%{$terme}%")
                ->orWhere('telephone', 'like', "%{$terme}%")
                ->orWhere('ville', 'like', "%{$terme}%");
        });
    }

    /**
     * Filtres avancés (statut, ville, sexe, tranche d'âge, plage d'inscription).
     */
    public function scopeFiltres(Builder $query, array $filtres): Builder
    {
        if (!empty($filtres['statut'])) {
            $query->whereIn('statut', (array) $filtres['statut']);
        }

        if (!empty($filtres['ville'])) {
            $query->whereIn('ville', (array) $filtres['ville']);
        }

        if (!empty($filtres['sexe'])) {
            $query->whereIn('sexe', (array) $filtres['sexe']);
        }

        if (!empty($filtres['age_min']) || !empty($filtres['age_max'])) {
            $query->where(function (Builder $q) use ($filtres) {
                if (!empty($filtres['age_min'])) {
                    $q->whereDate('date_naissance', '<=', now()->subYears((int) $filtres['age_min'])->toDateString());
                }
                if (!empty($filtres['age_max'])) {
                    $q->whereDate('date_naissance', '>=', now()->subYears((int) $filtres['age_max'])->toDateString());
                }
            });
        }

        if (!empty($filtres['formation_id'])) {
            $query->whereHas('inscriptions', function (Builder $q) use ($filtres) {
                $q->whereIn('formation_id', (array) $filtres['formation_id']);
            });
        }

        if (!empty($filtres['categorie_formation_id'])) {
            $query->whereHas('inscriptions.formation', function (Builder $q) use ($filtres) {
                $q->whereIn('categorie_formation_id', (array) $filtres['categorie_formation_id']);
            });
        }

        $query->plageDates('date_inscription', $filtres['inscription_de'] ?? null, $filtres['inscription_a'] ?? null);

        return $query;
    }
}
