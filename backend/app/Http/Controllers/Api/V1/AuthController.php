<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConnexionRequest;
use App\Http\Resources\UtilisateurResource;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Connexion et création de token Sanctum.
     */
    public function connexion(ConnexionRequest $request): JsonResponse
    {
        $donnees = $request->validated();
        $utilisateur = Utilisateur::where('email', $donnees['email'])->first();

        if (!$utilisateur || !Hash::check($donnees['mot_de_passe'], $utilisateur->mot_de_passe)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $deviceName = $donnees['device_name'] ?? 'spa';
        $token = $utilisateur->createToken($deviceName)->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'utilisateur' => new UtilisateurResource($utilisateur),
            'token' => $token,
        ]);
    }

    /**
     * Utilisateur connecté.
     */
    public function utilisateur(Request $request): UtilisateurResource
    {
        return new UtilisateurResource($request->user());
    }

    /**
     * Déconnexion (révocation du token courant).
     */
    public function deconnexion(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
