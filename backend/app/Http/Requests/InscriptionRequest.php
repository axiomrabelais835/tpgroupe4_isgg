<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $inscriptionId = $this->route('inscription')?->id;

        return [
            'etudiant_id' => ['required', 'integer', 'exists:etudiants,id', Rule::unique('inscriptions', 'etudiant_id')
                ->where('formation_id', $this->input('formation_id'))
                ->ignore($inscriptionId)],
            'formation_id' => ['required', 'integer', 'exists:formations,id'],
            'date_inscription' => ['required', 'date'],
            'statut' => ['sometimes', Rule::in(['en_attente', 'validee', 'annulee', 'terminee'])],
            'note_finale' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'etudiant_id.required' => "L'étudiant est obligatoire.",
            'etudiant_id.exists' => "L'étudiant sélectionné est introuvable.",
            'etudiant_id.unique' => 'Cet étudiant est déjà inscrit à cette formation.',
            'formation_id.required' => 'La formation est obligatoire.',
            'formation_id.exists' => 'La formation sélectionnée est introuvable.',
            'date_inscription.required' => "La date d'inscription est obligatoire.",
            'date_inscription.date' => "La date d'inscription est invalide.",
            'statut.in' => 'Le statut est invalide.',
            'note_finale.min' => 'La note doit être comprise entre 0 et 20.',
            'note_finale.max' => 'La note doit être comprise entre 0 et 20.',
            'observations.max' => 'Les observations ne doivent pas dépasser 1000 caractères.',
        ];
    }
}
