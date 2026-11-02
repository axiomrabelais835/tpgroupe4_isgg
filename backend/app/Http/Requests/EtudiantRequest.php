<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EtudiantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $etudiantId = $this->route('etudiant')?->id;

        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'sexe' => ['required', Rule::in(['M', 'F'])],
            'date_naissance' => ['required', 'date', 'before:today'],
            'lieu_naissance' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('etudiants', 'email')->ignore($etudiantId)],
            'telephone' => ['nullable', 'string', 'max:30'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:100'],
            'pays' => ['nullable', 'string', 'max:100'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'statut' => ['sometimes', Rule::in(['actif', 'suspendu', 'diplome', 'abandon'])],
            'date_inscription' => ['required', 'date'],
            // Optionnel: inscription initiale dans l'assistant multi-étapes
            'formation_id' => ['nullable', 'integer', 'exists:formations,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est obligatoire.',
            'nom.max' => 'Le nom ne doit pas dépasser 100 caractères.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'prenom.max' => 'Le prénom ne doit pas dépasser 100 caractères.',
            'sexe.required' => 'Le sexe est obligatoire.',
            'sexe.in' => 'Le sexe doit être M ou F.',
            'date_naissance.required' => 'La date de naissance est obligatoire.',
            'date_naissance.date' => 'La date de naissance est invalide.',
            'date_naissance.before' => 'La date de naissance doit être dans le passé.',
            'lieu_naissance.max' => 'Le lieu de naissance ne doit pas dépasser 100 caractères.',
            'email.required' => "L'adresse e-mail est obligatoire.",
            'email.email' => "L'adresse e-mail n'est pas valide.",
            'email.unique' => 'Cette adresse e-mail est déjà utilisée par un autre étudiant.',
            'telephone.max' => 'Le téléphone ne doit pas dépasser 30 caractères.',
            'adresse.max' => "L'adresse ne doit pas dépasser 255 caractères.",
            'ville.max' => 'La ville ne doit pas dépasser 100 caractères.',
            'pays.max' => 'Le pays ne doit pas dépasser 100 caractères.',
            'photo.image' => 'Le fichier doit être une image.',
            'photo.max' => "L'image ne doit pas dépasser 2 Mo.",
            'statut.in' => 'Le statut est invalide.',
            'date_inscription.required' => "La date d'inscription est obligatoire.",
            'date_inscription.date' => "La date d'inscription est invalide.",
            'formation_id.exists' => 'La formation sélectionnée est introuvable.',
        ];
    }
}
