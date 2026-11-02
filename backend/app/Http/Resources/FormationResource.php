<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categorie_formation_id' => $this->categorie_formation_id,
            'code' => $this->code,
            'intitule' => $this->intitule,
            'description' => $this->description,
            'duree_heures' => $this->duree_heures,
            'prix' => $this->prix,
            'niveau' => $this->niveau,
            'capacite_max' => $this->capacite_max,
            'date_debut' => $this->date_debut?->toDateString(),
            'date_fin' => $this->date_fin?->toDateString(),
            'statut' => $this->statut,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'categorie' => new CategorieFormationResource($this->whenLoaded('categorie')),
            'inscriptions' => InscriptionResource::collection($this->whenLoaded('inscriptions')),
            'inscriptions_count' => $this->whenCounted('inscriptions'),
            'remplissage_pourcentage' => $this->when(
                $this->relationLoaded('inscriptions') || $this->relationLoaded('inscriptionsCount'),
                fn () => $this->calculerRemplissage()
            ),
        ];
    }

    private function calculerRemplissage(): float
    {
        if ($this->capacite_max == 0) {
            return 0.0;
        }

        $inscrits = $this->relationLoaded('inscriptionsCount')
            ? $this->inscriptions_count
            : $this->inscriptions->count();

        return round(($inscrits / $this->capacite_max) * 100, 2);
    }
}
