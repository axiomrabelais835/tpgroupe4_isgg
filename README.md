# Groupe Rabelais — Gestion de formation

<p>
  <img src="frontend/public/logo-icone.svg" alt="Gestion de formation" height="72" />
</p>

Application de gestion d'un centre de formation : étudiants, catalogue de formations, inscriptions, paiements et tableau de bord analytique.

- **Backend** : API REST Laravel 12 (Sanctum, MySQL)
- **Frontend** : SPA React 19 + Vite + Tailwind CSS 4
- **Langue** : interface et base de données entièrement en français

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Stack technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Comptes de démonstration](#comptes-de-démonstration)
6. [Structure du projet](#structure-du-projet)
7. [Modèle de données](#modèle-de-données)
8. [API REST](#api-rest)
9. [Règles métier](#règles-métier)
10. [Tests](#tests)
11. [Build de production](#build-de-production)
12. [Dépannage](#dépannage)

---

## Fonctionnalités

### Tableau de bord
- KPI avec comparaison à la période précédente (étudiants, inscriptions, chiffre d'affaires, formations en cours)
- Évolution mensuelle des inscriptions (graphique en aires)
- Répartition des statuts étudiants (anneau) et des sexes
- Revenus mensuels (histogramme)
- Jauges de remplissage et de réussite
- Top 5 des formations les plus demandées
- Alertes « formations bientôt complètes »
- Dernières inscriptions et derniers paiements
- Filtre de période : 3 / 6 / 12 mois ou 30 derniers jours

### Étudiants
- Liste paginée côté serveur, tri, recherche multicritère, filtres avancés (statut, sexe, ville, âge, dates)
- Export CSV de la sélection filtrée
- Formulaire de création en 4 étapes (identité, coordonnées, photo, inscription) avec barre de progression
- Recadrage de photo, masque de téléphone, protection contre la perte de données
- Fiche détaillée en panneau latéral avec onglets Profil / Inscriptions / Paiements
- Suppression réversible (restauration via le toast « Annuler »)
- Actions groupées, visibilité des colonnes, avatars et badges de statut

### Formations
- Catalogue avec catégorie, niveau, prix, capacité, planning
- Jauge de remplissage et statut
- Fiche formation : statistiques, revenus encaissés, moyenne des notes, liste des inscrits
- Blocage de la suppression si des inscriptions actives existent

### Inscriptions
- Création / modification / suppression
- Contrôle de la capacité maximale et des doublons (même étudiant + même formation)
- Statuts : en attente, validée, terminée, annulée
- Note finale et observations

### Paiements
- Enregistrement des encaissements liés à une inscription
- Sélection de l'inscription par recherche (étudiant, matricule, formation)
- Modes : espèces, mobile money, virement, carte
- Référence et date de paiement

### Catégories
- Cartes colorées, compteur de formations rattachées
- Suppression refusée si la catégorie contient des formations

### Expérience utilisateur
- Thème clair / sombre persistant
- Barre latérale rétractable (état mémorisé)
- Recherche globale `Ctrl + K` (étudiants, formations, inscriptions)
- Fil d'Ariane, notifications, menu profil
- Routes protégées, gestion de l'expiration du jeton
- Toasts avec annulation, dialogues de confirmation, états vides et squelettes de chargement
- Interface responsive (mobile → desktop)

---

## Stack technique

| Couche | Technologies |
| --- | --- |
| Backend | PHP 8.2, Laravel 12, Laravel Sanctum, MySQL 8 (XAMPP) |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Données | TanStack Query 5, Axios, React Hook Form, Zod |
| UI | Radix UI (shadcn-style), lucide-react, Framer Motion, Sonner |
| Graphiques | Recharts |

---

## Prérequis

- **PHP 8.2+** avec les extensions `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`
- **Composer 2**
- **Node.js 20+** et **npm**
- **XAMPP** (Apache non nécessaire, MySQL suffit) ou tout serveur MySQL 8

Vérification rapide :

```bash
php -v
composer -V
node -v
npm -v
```

---

## Installation

### 1. Récupérer le projet

```bash
git clone <url-du-depot> GroupeRabelais
cd GroupeRabelais
```

### 2. Démarrer MySQL avec XAMPP

1. Ouvrir le **XAMPP Control Panel**.
2. Démarrer le module **MySQL**.
3. Ouvrir phpMyAdmin : <http://localhost/phpmyadmin>.
4. Créer une base nommée **`gestion_formation`** avec l'interclassement **`utf8mb4_unicode_ci`**.

En ligne de commande :

```sql
CREATE DATABASE gestion_formation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Installer le backend

```bash
cd backend
composer install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
php artisan key:generate
```

Vérifier la configuration de la base dans `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_formation
DB_USERNAME=root
DB_PASSWORD=
```

Créer les tables, insérer le compte administrateur et le lien de stockage des photos :

```bash
php artisan migrate:fresh --seed
php artisan storage:link
```

Lancer l'API :

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

L'API répond sur <http://127.0.0.1:8000/api/v1>.

### 4. Installer le frontend

Dans un second terminal :

```bash
cd frontend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
npm run dev
```

L'application est accessible sur <http://localhost:5173>.

> Le frontend utilise un proxy Vite : les requêtes `/api` sont redirigées vers `http://127.0.0.1:8000`.
> Pour pointer vers une autre API, modifier `VITE_API_URL` dans `frontend/.env`.

### 5. Se connecter

Ouvrir <http://localhost:5173> et utiliser le compte administrateur ci-dessous.

---

## Compte administrateur

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Administrateur | `rabelaisallomavo@gmail.com` | `Rabelais835@` |

Pour créer ou recréer ce compte administrateur :

```bash
cd backend
php artisan migrate:fresh --seed
```

Ce compte est le seul compte créé par le seeder. Aucune autre donnée de démonstration n'est insérée en base de données.

### Créer un compte administrateur manuellement

Si vous préférez créer le compte administrateur sans exécuter le seeder complet, utilisez l'outil Tinker de Laravel :

```bash
cd backend
php artisan tinker
```

Puis, dans l'interpréteur interactif :

```php
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;

Utilisateur::create([
    'nom' => 'Administrateur',
    'email' => 'rabelaisallomavo@gmail.com',
    'mot_de_passe' => Hash::make('Rabelais835@'),
    'role' => 'admin',
    'email_verified_at' => now(),
]);
```

Quitter Tinker avec `exit` ou `Ctrl+D`.

---

## Structure du projet

```text
GroupeRabelais/
├── backend/                     API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/   Contrôleurs REST
│   │   │   ├── Requests/             Validation + messages FR
│   │   │   ├── Resources/            Sérialisation JSON
│   │   │   └── Middleware/
│   │   ├── Models/                   Modèles Eloquent (tables FR)
│   │   ├── Policies/                 Autorisations
│   │   ├── Services/                 Logique métier & statistiques
│   │   └── Traits/                   Scopes de recherche / filtres
│   ├── database/
│   │   ├── migrations/               Schéma MySQL
│   │   ├── factories/                Données de test
│   │   └── seeders/                  Données de démonstration
│   ├── routes/api.php                Routes `/api/v1`
│   └── tests/Feature/                Tests fonctionnels
│
├── frontend/                    SPA React
│   ├── src/
│   │   ├── app/                 Router, providers, query client
│   │   ├── components/
│   │   │   ├── ui/              Primitives (bouton, dialogue, table…)
│   │   │   ├── layout/          Sidebar, header, fil d'Ariane, recherche
│   │   │   ├── data-table/      Tableau de données avancé
│   │   │   └── shared/          Composants métier réutilisables
│   │   ├── features/            Pages par domaine
│   │   │   ├── auth/            Connexion, route protégée
│   │   │   ├── dashboard/       Tableau de bord
│   │   │   ├── etudiants/       Liste, formulaire, fiche
│   │   │   ├── formations/      Liste, formulaire, fiche
│   │   │   ├── inscriptions/
│   │   │   ├── paiements/
│   │   │   ├── categories/
│   │   │   ├── parametres/
│   │   │   └── erreurs/         Page 404
│   │   ├── lib/                 Axios, schémas Zod, utilitaires
│   │   ├── services/            Appels API
│   │   └── hooks/               Hooks personnalisés
│   └── vite.config.js           Alias `@`, proxy `/api`
│
└── README.md
```

---

## Modèle de données

| Table | Rôle | Principales colonnes |
| --- | --- | --- |
| `utilisateurs` | Comptes d'accès | `nom`, `email`, `mot_de_passe`, `role` |
| `etudiants` | Dossiers étudiants | `matricule`, `nom`, `prenom`, `sexe`, `date_naissance`, `email`, `telephone`, `ville`, `statut`, `photo` |
| `categories_formations` | Thématiques | `nom`, `description`, `couleur` |
| `formations` | Catalogue | `code`, `intitule`, `categorie_formation_id`, `niveau`, `duree_heures`, `prix`, `capacite_max`, `date_debut`, `date_fin`, `statut` |
| `inscriptions` | Liens étudiant ↔ formation | `etudiant_id`, `formation_id`, `date_inscription`, `statut`, `note_finale`, `observations` |
| `paiements` | Encaissements | `inscription_id`, `montant`, `mode`, `reference`, `date_paiement` |

Contraintes notables :

- `matricule` et `code` uniques
- Unicité du couple (`etudiant_id`, `formation_id`) dans `inscriptions`
- Suppressions en cascade des inscriptions et paiements liés

---

## API REST

Base : `http://127.0.0.1:8000/api/v1`

Toutes les routes, sauf la connexion, exigent un jeton Sanctum :

```http
Authorization: Bearer <token>
Accept: application/json
```

### Authentification

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/connexion` | Connexion (`email`, `mot_de_passe`) |
| `GET` | `/auth/utilisateur` | Utilisateur courant |
| `POST` | `/auth/deconnexion` | Révocation du jeton |

### Ressources

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/etudiants` | Liste paginée |
| `POST` | `/etudiants` | Création (multipart si photo) |
| `GET` | `/etudiants/{id}` | Détail |
| `PUT/PATCH` | `/etudiants/{id}` | Mise à jour |
| `DELETE` | `/etudiants/{id}` | Suppression logique |
| `POST` | `/etudiants/{id}/restaurer` | Restauration |
| `GET` | `/etudiants-export/csv` | Export CSV filtré |
| `GET/POST` | `/formations` | Liste / création |
| `GET/PUT/DELETE` | `/formations/{id}` | Détail / mise à jour / suppression |
| `GET/POST` | `/categories` | Liste / création |
| `GET/PUT/DELETE` | `/categories/{id}` | Détail / mise à jour / suppression |
| `GET/POST` | `/inscriptions` | Liste / création |
| `GET/PUT/DELETE` | `/inscriptions/{id}` | Détail / mise à jour / suppression |
| `GET/POST` | `/paiements` | Liste / création |
| `GET/PUT/DELETE` | `/paiements/{id}` | Détail / mise à jour / suppression |

### Paramètres de liste

| Paramètre | Exemple | Description |
| --- | --- | --- |
| `page` | `2` | Page courante |
| `per_page` | `12` | Taille de page (max 100) |
| `search` | `rabelais` | Recherche multicritère |
| `sort` | `nom` | Colonne de tri (liste blanche côté serveur) |
| `direction` | `asc` / `desc` | Sens du tri |
| `statut` | `actif` | Filtre statut |
| `ville`, `sexe`, `age_min`, `age_max` | — | Filtres étudiants |
| `formation_id`, `categorie_formation_id` | — | Filtres croisés |
| `debut_de`, `debut_a` | `2026-01-01` | Période (formations) |
| `inscription_de`, `inscription_a` | `2026-01-01` | Période (étudiants / inscriptions) |
| `paiement_de`, `paiement_a` | `2026-01-01` | Période (paiements) |
| `avec_inscriptions` | `1` | Charge les relations |

### Statistiques

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/statistiques/tableau-de-bord` | Agrégat complet du tableau de bord |
| `GET` | `/statistiques/kpis` | KPI + variation vs période précédente |
| `GET` | `/statistiques/evolution-inscriptions?mois=12` | Évolution mensuelle |
| `GET` | `/statistiques/repartition-statuts` | Répartition par statut |
| `GET` | `/statistiques/repartition-sexes` | Répartition par sexe |
| `GET` | `/statistiques/repartition-tranches-age` | Tranches d'âge |
| `GET` | `/statistiques/top-formations?limite=5` | Formations les plus demandées |
| `GET` | `/statistiques/inscriptions-par-formation` | Inscriptions par formation |
| `GET` | `/statistiques/repartition-categories` | Répartition par catégorie |
| `GET` | `/statistiques/revenus-mensuels?mois=12` | Revenus par mois |
| `GET` | `/statistiques/remplissage-formations` | Taux de remplissage |
| `GET` | `/statistiques/formations-bientot-completes?seuil=70` | Alertes capacité |
| `GET` | `/statistiques/dernieres-inscriptions?limite=6` | Dernières inscriptions |
| `GET` | `/statistiques/paiements-recents?limite=6` | Derniers paiements |

### Format des réponses

Collection paginée :

```json
{
  "data": [],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 13, "per_page": 12, "total": 150 }
}
```

Erreur de validation (`422`) :

```json
{
  "message": "Les données fournies sont invalides.",
  "erreurs": {
    "email": ["L'adresse e-mail est déjà utilisée."]
  }
}
```

---

## Règles métier

- **Capacité** : une inscription est refusée si la formation a atteint `capacite_max`.
- **Doublons** : un étudiant ne peut pas être inscrit deux fois à la même formation.
- **Suppression de formation** : impossible si des inscriptions actives existent.
- **Suppression de catégorie** : impossible si des formations y sont rattachées.
- **Paiements** : toujours rattachés à une inscription existante ; montant strictement positif.
- **Matricules** : générés automatiquement au format `ETU-<année>-<séquence>`.

---

## Tests

Le backend dispose de tests fonctionnels (authentification, CRUD, règles métier, statistiques) exécutés sur SQLite en mémoire :

```bash
cd backend
php artisan test
```

Couverture principale :

- connexion / déconnexion / jeton invalide
- CRUD étudiants, formations, catégories, inscriptions, paiements
- validation et messages d'erreur
- capacité maximale et doublons
- suppression protégée (formation / catégorie)
- endpoints statistiques et agrégat du tableau de bord

---

## Build de production

```bash
cd frontend
npm run build
```

Les fichiers statiques sont générés dans `frontend/dist`. Ils peuvent être servis par Apache/Nginx, avec `/api` redirigé vers le backend Laravel.

Côté backend :

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Penser à définir `APP_ENV=production` et `APP_DEBUG=false` dans `.env`.

---

## Dépannage

| Problème | Solution |
| --- | --- |
| `SQLSTATE[HY000] [2002]` | MySQL n'est pas démarré dans XAMPP |
| `Unknown database 'gestion_formation'` | Créer la base dans phpMyAdmin |
| Erreur CORS / requêtes bloquées | Vérifier le proxy Vite et que l'API tourne sur le port 8000 |
| `401 Unauthorized` après un `migrate:fresh` | Les jetons ont été supprimés : se reconnecter |
| Photos non affichées | Exécuter `php artisan storage:link` |
| Modifications `.env` non prises en compte | `php artisan config:clear` |
| Port 8000 déjà utilisé | `php artisan serve --port=8001` (et adapter le proxy Vite) |
| Accents mal affichés dans la base | Vérifier `utf8mb4` / `utf8mb4_unicode_ci` |

---

## Licence

Projet pédagogique — Groupe Rabelais.
