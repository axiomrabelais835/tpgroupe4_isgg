<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'etudiant_id' => $this->etudiant_id,
            'formation_id' => $this->formation_id,
            'date_inscription' => $this->date_inscription?->toDateString(),
            'statut' => $this->statut,
            'note_finale' => $this->note_finale,
            'observations' => $this->observations,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'etudiant' => new EtudiantResource($this->whenLoaded('etudiant')),
            'formation' => new FormationResource($this->whenLoaded('formation')),
            'paiements' => PaiementResource::collection($this->whenLoaded('paiements')),
            'montant_total_paye' => $this->when(
                $this->relationLoaded('paiements'),
                fn () => round($this->paiements->sum('montant'), 2)
            ),
        ];
    }
}
