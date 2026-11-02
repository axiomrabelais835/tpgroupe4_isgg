<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EtudiantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'matricule' => $this->matricule,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'nom_complet' => trim("{$this->prenom} {$this->nom}"),
            'sexe' => $this->sexe,
            'date_naissance' => $this->date_naissance?->toDateString(),
            'lieu_naissance' => $this->lieu_naissance,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'adresse' => $this->adresse,
            'ville' => $this->ville,
            'pays' => $this->pays,
            'photo' => $this->photo ? url('storage/'.$this->photo) : null,
            'statut' => $this->statut,
            'date_inscription' => $this->date_inscription?->toDateString(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'inscriptions' => InscriptionResource::collection($this->whenLoaded('inscriptions')),
            'inscriptions_count' => $this->whenCounted('inscriptions'),
        ];
    }
}
