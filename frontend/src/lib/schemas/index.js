import { z } from 'zod'

const telephoneRegex = /^(?:(?:\+|00)?(221|33|225|229|226|227|228|223|237|241|242|243|212|216|213|20)\s?)?[0-9\s.-]{8,15}$/

export const etudiantSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100, 'Le nom est trop long.'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.').max(100, 'Le prénom est trop long.'),
  sexe: z.enum(['M', 'F'], { message: 'Le sexe est obligatoire.' }),
  date_naissance: z
    .string()
    .min(1, 'La date de naissance est obligatoire.')
    .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v) < new Date(), 'La date de naissance doit être dans le passé.'),
  lieu_naissance: z.string().max(100, 'Le lieu de naissance est trop long.').optional().or(z.literal('')),
  email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("L'adresse e-mail n'est pas valide."),
  telephone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || telephoneRegex.test(v), 'Le numéro de téléphone est invalide.'),
  adresse: z.string().max(255, "L'adresse est trop longue.").optional().or(z.literal('')),
  ville: z.string().max(100, 'La ville est trop longue.').optional().or(z.literal('')),
  pays: z.string().max(100, 'Le pays est trop long.').optional().or(z.literal('')),
  statut: z.enum(['actif', 'suspendu', 'diplome', 'abandon']).default('actif'),
  date_inscription: z.string().min(1, "La date d'inscription est obligatoire."),
  formation_id: z.union([z.string(), z.number()]).optional().nullable(),
})

export const formationSchema = z
  .object({
    categorie_formation_id: z.union([z.string(), z.number()]).refine((v) => Boolean(v), 'La catégorie est obligatoire.'),
    code: z.string().min(2, 'Le code est obligatoire.').max(30, 'Le code est trop long.'),
    intitule: z.string().min(3, "L'intitulé doit contenir au moins 3 caractères.").max(200, "L'intitulé est trop long."),
    description: z.string().optional().or(z.literal('')),
    duree_heures: z.coerce.number().int().min(1, 'La durée minimale est de 1 heure.').max(1000, 'La durée est trop élevée.'),
    prix: z.coerce.number().min(0, 'Le prix ne peut pas être négatif.'),
    niveau: z.enum(['debutant', 'intermediaire', 'avance'], { message: 'Le niveau est obligatoire.' }),
    capacite_max: z.coerce.number().int().min(1, 'La capacité minimale est de 1.').max(500, 'La capacité est trop élevée.'),
    date_debut: z.string().min(1, 'La date de début est obligatoire.'),
    date_fin: z.string().optional().or(z.literal('')),
    statut: z.enum(['planifiee', 'en_cours', 'terminee', 'annulee']).default('planifiee'),
  })
  .refine((v) => !v.date_fin || new Date(v.date_fin) >= new Date(v.date_debut), {
    message: 'La date de fin doit être postérieure ou égale à la date de début.',
    path: ['date_fin'],
  })

export const categorieSchema = z.object({
  nom: z.string().min(2, 'Le nom est obligatoire.').max(100, 'Le nom est trop long.'),
  description: z.string().max(500, 'La description est trop longue.').optional().or(z.literal('')),
  couleur: z.string().max(20).optional().or(z.literal('')),
})

export const inscriptionSchema = z.object({
  etudiant_id: z.union([z.string(), z.number()]).refine((v) => Boolean(v), "L'étudiant est obligatoire."),
  formation_id: z.union([z.string(), z.number()]).refine((v) => Boolean(v), 'La formation est obligatoire.'),
  date_inscription: z.string().min(1, "La date d'inscription est obligatoire."),
  statut: z.enum(['en_attente', 'validee', 'annulee', 'terminee']).default('en_attente'),
  note_finale: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .refine((v) => v === '' || v === null || v === undefined || (Number(v) >= 0 && Number(v) <= 20), 'La note doit être comprise entre 0 et 20.'),
  observations: z.string().max(1000, 'Les observations sont trop longues.').optional().or(z.literal('')),
})

export const paiementSchema = z.object({
  inscription_id: z.union([z.string(), z.number()]).refine((v) => Boolean(v), "L'inscription est obligatoire."),
  montant: z.coerce.number().min(0.01, 'Le montant doit être supérieur à 0.'),
  mode: z.enum(['especes', 'mobile_money', 'virement', 'carte'], { message: 'Le mode de paiement est obligatoire.' }),
  reference: z.string().max(100, 'La référence est trop longue.').optional().or(z.literal('')),
  date_paiement: z.string().min(1, 'La date de paiement est obligatoire.'),
})
