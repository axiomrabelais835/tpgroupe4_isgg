<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inscription_id' => $this->inscription_id,
            'montant' => $this->montant,
            'mode' => $this->mode,
            'reference' => $this->reference,
            'date_paiement' => $this->date_paiement?->toDateString(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'inscription' => new InscriptionResource($this->whenLoaded('inscription')),
        ];
    }
}
