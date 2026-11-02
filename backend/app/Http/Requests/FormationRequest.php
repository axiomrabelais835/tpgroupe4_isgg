<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $formationId = $this->route('formation')?->id;

        return [
            'categorie_formation_id' => ['required', 'integer', 'exists:categories_formations,id'],
            'code' => ['required', 'string', 'max:30', Rule::unique('formations', 'code')->ignore($formationId)],
            'intitule' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'duree_heures' => ['required', 'integer', 'min:1', 'max:1000'],
            'prix' => ['required', 'numeric', 'min:0'],
            'niveau' => ['required', Rule::in(['debutant', 'intermediaire', 'avance'])],
            'capacite_max' => ['required', 'integer', 'min:1', 'max:500'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'statut' => ['sometimes', Rule::in(['planifiee', 'en_cours', 'terminee', 'annulee'])],
        ];
    }

    public function messages(): array
    {
        return [
            'categorie_formation_id.required' => 'La catégorie est obligatoire.',
            'categorie_formation_id.exists' => 'La catégorie sélectionnée est introuvable.',
            'code.required' => 'Le code est obligatoire.',
            'code.unique' => 'Ce code de formation est déjà utilisé.',
            'intitule.required' => "L'intitulé est obligatoire.",
            'duree_heures.required' => 'La durée est obligatoire.',
            'duree_heures.min' => 'La durée minimale est de 1 heure.',
            'duree_heures.max' => 'La durée maximale est de 1000 heures.',
            'prix.required' => 'Le prix est obligatoire.',
            'prix.min' => 'Le prix ne peut pas être négatif.',
            'niveau.required' => 'Le niveau est obligatoire.',
            'niveau.in' => 'Le niveau est invalide.',
            'capacite_max.required' => 'La capacité maximale est obligatoire.',
            'capacite_max.min' => 'La capacité minimale est de 1 étudiant.',
            'capacite_max.max' => 'La capacité maximale est de 500 étudiants.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'statut.in' => 'Le statut est invalide.',
        ];
    }
}
