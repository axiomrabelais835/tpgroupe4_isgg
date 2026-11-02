<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'montant' => ['required', 'numeric', 'min:0.01'],
            'mode' => ['required', Rule::in(['especes', 'mobile_money', 'virement', 'carte'])],
            'reference' => ['nullable', 'string', 'max:100'],
            'date_paiement' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'inscription_id.required' => "L'inscription est obligatoire.",
            'inscription_id.exists' => "L'inscription sélectionnée est introuvable.",
            'montant.required' => 'Le montant est obligatoire.',
            'montant.min' => 'Le montant doit être supérieur à 0.',
            'mode.required' => 'Le mode de paiement est obligatoire.',
            'mode.in' => 'Le mode de paiement est invalide.',
            'reference.max' => 'La référence ne doit pas dépasser 100 caractères.',
            'date_paiement.required' => 'La date de paiement est obligatoire.',
            'date_paiement.date' => 'La date de paiement est invalide.',
        ];
    }
}
