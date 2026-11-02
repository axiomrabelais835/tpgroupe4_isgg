<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscriptionRequest;
use App\Http\Resources\InscriptionResource;
use App\Models\Formation;
use App\Models\Inscription;
use App\Services\InscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InscriptionController extends Controller
{
    public function __construct(private InscriptionService $inscriptionService)
    {
    }

    /**
     * Liste paginée avec recherche, tri et filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Inscription::class);

        $whitelist = ['date_inscription', 'note_finale', 'created_at'];

        $query = Inscription::query()
            ->recherche($request->input('search'))
            ->filtres($request->only([
                'statut', 'etudiant_id', 'formation_id', 'inscription_de', 'inscription_a',
            ]))
            ->triePar($request->input('sort'), $request->input('direction'), $whitelist)
            ->with(['etudiant', 'formation']);

        if ($request->boolean('avec_paiements')) {
            $query->with('paiements');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return InscriptionResource::collection($query->paginate($perPage));
    }

    /**
     * Création d'une inscription (contrôles capacité + doublon).
     */
    public function store(InscriptionRequest $request): JsonResponse
    {
        $this->authorize('create', Inscription::class);

        $donnees = $request->validated();

        $this->inscriptionService->verifierDoublon(
            (int) $donnees['etudiant_id'],
            (int) $donnees['formation_id']
        );

        $formation = Formation::findOrFail($donnees['formation_id']);

        if (in_array($donnees['statut'] ?? 'en_attente', ['en_attente', 'validee'])) {
            $this->inscriptionService->verifierCapacite($formation);
        }

        $inscription = Inscription::create($donnees);

        return response()->json([
            'message' => 'Inscription créée avec succès.',
            'inscription' => new InscriptionResource($inscription->load('etudiant', 'formation')),
        ], 201);
    }

    /**
     * Détail d'une inscription.
     */
    public function show(Inscription $inscription): InscriptionResource
    {
        $this->authorize('view', $inscription);

        return new InscriptionResource(
            $inscription->load('etudiant', 'formation', 'paiements')
        );
    }

    /**
     * Mise à jour d'une inscription.
     */
    public function update(InscriptionRequest $request, Inscription $inscription): JsonResponse
    {
        $this->authorize('update', $inscription);

        $donnees = $request->validated();

        $this->inscriptionService->verifierDoublon(
            (int) $donnees['etudiant_id'],
            (int) $donnees['formation_id'],
            $inscription->id
        );

        if (in_array($donnees['statut'] ?? $inscription->statut, ['en_attente', 'validee'])) {
            $formation = Formation::findOrFail($donnees['formation_id']);
            $this->inscriptionService->verifierCapacite($formation, $inscription->id);
        }

        $inscription->update($donnees);

        return response()->json([
            'message' => 'Inscription mise à jour avec succès.',
            'inscription' => new InscriptionResource($inscription->fresh()->load('etudiant', 'formation')),
        ]);
    }

    /**
     * Suppression d'une inscription.
     */
    public function destroy(Inscription $inscription): JsonResponse
    {
        $this->authorize('delete', $inscription);

        $inscription->delete();

        return response()->json([
            'message' => 'Inscription supprimée avec succès.',
        ]);
    }
}
