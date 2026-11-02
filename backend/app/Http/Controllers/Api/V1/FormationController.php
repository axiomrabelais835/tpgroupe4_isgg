<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use App\Services\FormationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FormationController extends Controller
{
    public function __construct(private FormationService $formationService)
    {
    }

    /**
     * Liste paginée avec recherche, tri et filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Formation::class);

        $whitelist = ['code', 'intitule', 'prix', 'duree_heures', 'capacite_max', 'date_debut', 'created_at'];

        $query = Formation::query()
            ->recherche($request->input('search'))
            ->filtres($request->only([
                'statut', 'niveau', 'categorie_formation_id', 'debut_de', 'debut_a',
            ]))
            ->triePar($request->input('sort'), $request->input('direction'), $whitelist)
            ->with('categorie');

        if ($request->boolean('avec_inscriptions')) {
            $query->withCount('inscriptions');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return FormationResource::collection($query->paginate($perPage));
    }

    /**
     * Création d'une formation.
     */
    public function store(FormationRequest $request): JsonResponse
    {
        $this->authorize('create', Formation::class);

        $formation = Formation::create($request->validated());

        return response()->json([
            'message' => 'Formation créée avec succès.',
            'formation' => new FormationResource($formation->load('categorie')),
        ], 201);
    }

    /**
     * Détail d'une formation.
     */
    public function show(Formation $formation): FormationResource
    {
        $this->authorize('view', $formation);

        return new FormationResource(
            $formation->load('categorie', 'inscriptions.etudiant', 'inscriptions.paiements')
        );
    }

    /**
     * Mise à jour d'une formation.
     */
    public function update(FormationRequest $request, Formation $formation): JsonResponse
    {
        $this->authorize('update', $formation);

        $formation->update($request->validated());

        return response()->json([
            'message' => 'Formation mise à jour avec succès.',
            'formation' => new FormationResource($formation->fresh()->load('categorie')),
        ]);
    }

    /**
     * Suppression d'une formation (bloquée si inscriptions actives).
     */
    public function destroy(Formation $formation): JsonResponse
    {
        $this->authorize('delete', $formation);

        $this->formationService->verifierSuppression($formation);

        $formation->delete();

        return response()->json([
            'message' => 'Formation supprimée avec succès.',
        ]);
    }
}
