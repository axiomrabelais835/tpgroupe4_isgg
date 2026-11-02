<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategorieFormationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categorieId = $this->route('categorie')?->id;

        return [
            'nom' => ['required', 'string', 'max:100', Rule::unique('categories_formations', 'nom')->ignore($categorieId)],
            'description' => ['nullable', 'string', 'max:500'],
            'couleur' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de la catégorie est obligatoire.',
            'nom.unique' => 'Ce nom de catégorie existe déjà.',
            'nom.max' => 'Le nom ne doit pas dépasser 100 caractères.',
            'description.max' => 'La description ne doit pas dépasser 500 caractères.',
            'couleur.max' => 'La couleur ne doit pas dépasser 20 caractères.',
        ];
    }
}
