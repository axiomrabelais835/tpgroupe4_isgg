<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaiementRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaiementController extends Controller
{
    /**
     * Liste paginée avec recherche, tri et filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Paiement::class);

        $whitelist = ['montant', 'date_paiement', 'created_at'];

        $query = Paiement::query()
            ->recherche($request->input('search'))
            ->filtres($request->only(['mode', 'inscription_id', 'formation_id', 'etudiant_id', 'paiement_de', 'paiement_a']))
            ->triePar($request->input('sort'), $request->input('direction'), $whitelist)
            ->with('inscription.etudiant', 'inscription.formation');

        $perPage = min((int) $request->input('per_page', 15), 100);

        return PaiementResource::collection($query->paginate($perPage));
    }

    /**
     * Création d'un paiement.
     */
    public function store(PaiementRequest $request): JsonResponse
    {
        $this->authorize('create', Paiement::class);

        $paiement = Paiement::create($request->validated());

        return response()->json([
            'message' => 'Paiement enregistré avec succès.',
            'paiement' => new PaiementResource($paiement->load('inscription.etudiant', 'inscription.formation')),
        ], 201);
    }

    /**
     * Détail d'un paiement.
     */
    public function show(Paiement $paiement): PaiementResource
    {
        $this->authorize('view', $paiement);

        return new PaiementResource($paiement->load('inscription.etudiant', 'inscription.formation'));
    }

    /**
     * Mise à jour d'un paiement.
     */
    public function update(PaiementRequest $request, Paiement $paiement): JsonResponse
    {
        $this->authorize('update', $paiement);

        $paiement->update($request->validated());

        return response()->json([
            'message' => 'Paiement mis à jour avec succès.',
            'paiement' => new PaiementResource($paiement->fresh()->load('inscription.etudiant', 'inscription.formation')),
        ]);
    }

    /**
     * Suppression d'un paiement.
     */
    public function destroy(Paiement $paiement): JsonResponse
    {
        $this->authorize('delete', $paiement);

        $paiement->delete();

        return response()->json([
            'message' => 'Paiement supprimé avec succès.',
        ]);
    }
}
