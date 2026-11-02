<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\EtudiantRequest;
use App\Http\Resources\EtudiantResource;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class EtudiantController extends Controller
{
    /**
     * Liste paginée avec recherche, tri et filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Etudiant::class);
        $whitelist = ['nom', 'prenom', 'matricule', 'email', 'date_inscription', 'date_naissance', 'created_at'];

        $query = Etudiant::query()
            ->recherche($request->input('search'))
            ->filtres($request->only([
                'statut', 'ville', 'sexe', 'age_min', 'age_max', 'formation_id', 'categorie_formation_id',
                'inscription_de', 'inscription_a',
            ]))
            ->triePar($request->input('sort'), $request->input('direction'), $whitelist);

        if ($request->boolean('avec_inscriptions')) {
            $query->with('inscriptions.formation');
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return EtudiantResource::collection($query->paginate($perPage));
    }

    /**
     * Création d'un étudiant (avec inscription initiale optionnelle).
     */
    public function store(EtudiantRequest $request): JsonResponse
    {
        $this->authorize('create', Etudiant::class);

        $donnees = $request->validated();
        $photoPath = $this->gererPhoto($request);

        if ($photoPath) {
            $donnees['photo'] = $photoPath;
        }

        $etudiant = Etudiant::create($donnees);

        if (!empty($donnees['formation_id'])) {
            $formation = Formation::find($donnees['formation_id']);
            if ($formation) {
                Inscription::create([
                    'etudiant_id' => $etudiant->id,
                    'formation_id' => $formation->id,
                    'date_inscription' => $etudiant->date_inscription,
                    'statut' => 'en_attente',
                ]);
            }
        }

        return response()->json([
            'message' => 'Étudiant créé avec succès.',
            'etudiant' => new EtudiantResource($etudiant->load('inscriptions.formation')),
        ], 201);
    }

    /**
     * Détail d'un étudiant.
     */
    public function show(Etudiant $etudiant): EtudiantResource
    {
        $this->authorize('view', $etudiant);

        return new EtudiantResource($etudiant->load('inscriptions.formation', 'inscriptions.paiements'));
    }

    /**
     * Mise à jour d'un étudiant.
     */
    public function update(EtudiantRequest $request, Etudiant $etudiant): JsonResponse
    {
        $this->authorize('update', $etudiant);

        $donnees = $request->validated();
        $photoPath = $this->gererPhoto($request, $etudiant);

        if ($photoPath) {
            $donnees['photo'] = $photoPath;
        }

        $etudiant->update($donnees);

        return response()->json([
            'message' => 'Étudiant mis à jour avec succès.',
            'etudiant' => new EtudiantResource($etudiant->fresh()->load('inscriptions.formation')),
        ]);
    }

    /**
     * Suppression (soft delete) d'un étudiant.
     */
    public function destroy(Etudiant $etudiant): JsonResponse
    {
        $this->authorize('delete', $etudiant);

        $etudiant->delete();

        return response()->json([
            'message' => 'Étudiant supprimé avec succès.',
        ]);
    }

    /**
     * Restauration d'un étudiant supprimé (soft delete).
     */
    public function restaurer(Etudiant $etudiant): JsonResponse
    {
        $this->authorize('delete', $etudiant);

        $etudiant->restore();

        return response()->json([
            'message' => 'Étudiant restauré avec succès.',
            'etudiant' => new EtudiantResource($etudiant->fresh()),
        ]);
    }

    /**
     * Export CSV de la liste filtrée.
     */
    public function exporter(Request $request)
    {
        $this->authorize('export', Etudiant::class);

        $etudiants = Etudiant::query()
            ->recherche($request->input('search'))
            ->filtres($request->only([
                'statut', 'ville', 'sexe', 'age_min', 'age_max', 'formation_id', 'categorie_formation_id',
                'inscription_de', 'inscription_a',
            ]))
            ->get(['matricule', 'nom', 'prenom', 'sexe', 'email', 'telephone', 'ville', 'pays', 'statut', 'date_inscription']);

        $nomFichier = 'etudiants_'.now()->format('Ymd_His').'.csv';

        $callback = function () use ($etudiants) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Matricule', 'Nom', 'Prénom', 'Sexe', 'Email', 'Téléphone', 'Ville', 'Pays', 'Statut', "Date d'inscription"], ';');

            foreach ($etudiants as $etudiant) {
                fputcsv($handle, [
                    $etudiant->matricule,
                    $etudiant->nom,
                    $etudiant->prenom,
                    $etudiant->sexe,
                    $etudiant->email,
                    $etudiant->telephone,
                    $etudiant->ville,
                    $etudiant->pays,
                    $etudiant->statut,
                    $etudiant->date_inscription?->toDateString(),
                ], ';');
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $nomFichier, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function gererPhoto(Request $request, ?Etudiant $etudiant = null): ?string
    {
        if (!$request->hasFile('photo')) {
            return null;
        }

        if ($etudiant?->photo && Storage::disk('public')->exists($etudiant->photo)) {
            Storage::disk('public')->delete($etudiant->photo);
        }

        return $request->file('photo')->store('etudiants/photos', 'public');
    }
}
