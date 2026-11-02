<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategorieFormationRequest;
use App\Http\Resources\CategorieFormationResource;
use App\Models\CategorieFormation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategorieFormationController extends Controller
{
    /**
     * Liste paginée avec recherche et tri.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CategorieFormation::class);

        $whitelist = ['nom', 'created_at'];

        $query = CategorieFormation::query()
            ->recherche($request->input('search'))
            ->triePar($request->input('sort'), $request->input('direction'), $whitelist)
            ->withCount('formations');

        $perPage = min((int) $request->input('per_page', 15), 100);

        return CategorieFormationResource::collection($query->paginate($perPage));
    }

    /**
     * Création d'une catégorie.
     */
    public function store(CategorieFormationRequest $request): JsonResponse
    {
        $this->authorize('create', CategorieFormation::class);

        $categorie = CategorieFormation::create($request->validated());

        return response()->json([
            'message' => 'Catégorie créée avec succès.',
            'categorie' => new CategorieFormationResource($categorie),
        ], 201);
    }

    /**
     * Détail d'une catégorie.
     */
    public function show(CategorieFormation $categorie): CategorieFormationResource
    {
        $this->authorize('view', $categorie);

        return new CategorieFormationResource($categorie->load('formations'));
    }

    /**
     * Mise à jour d'une catégorie.
     */
    public function update(CategorieFormationRequest $request, CategorieFormation $categorie): JsonResponse
    {
        $this->authorize('update', $categorie);

        $categorie->update($request->validated());

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès.',
            'categorie' => new CategorieFormationResource($categorie->fresh()),
        ]);
    }

    /**
     * Suppression d'une catégorie.
     */
    public function destroy(CategorieFormation $categorie): JsonResponse
    {
        $this->authorize('delete', $categorie);

        if ($categorie->formations()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie contenant des formations.',
                'erreurs' => [
                    'categorie' => ['Supprimez ou déplacez d’abord les formations associées.'],
                ],
            ], 422);
        }

        $categorie->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès.',
        ]);
    }
}
