import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { etudiantSchema } from '@/lib/schemas'
import { etudiantsService, formationsService } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoUpload } from '@/components/shared/PhotoUpload'
import { cn } from '@/lib/utils'

const ETAPES = [
  { titre: 'Identité', champs: ['nom', 'prenom', 'sexe', 'date_naissance', 'lieu_naissance'] },
  { titre: 'Coordonnées', champs: ['email', 'telephone', 'adresse', 'ville', 'pays'] },
  { titre: 'Photo', champs: [] },
  { titre: 'Inscription', champs: ['statut', 'date_inscription', 'formation_id'] },
]

function ErreurChamp({ message }) {
  if (!message) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  )
}

export function FormulaireEtudiant({ ouverte, onOpenChange, etudiant = null, onSucces }) {
  const queryClient = useQueryClient()
  const modeEdition = Boolean(etudiant)
  const [etape, setEtape] = useState(0)
  const [photo, setPhoto] = useState(null)

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(etudiantSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      sexe: '',
      date_naissance: '',
      lieu_naissance: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      pays: 'Bénin',
      statut: 'actif',
      date_inscription: new Date().toISOString().slice(0, 10),
      formation_id: '',
    },
  })

  const { data: formations } = useQuery({
    queryKey: ['formations-options'],
    queryFn: () => formationsService.liste({ per_page: 100, sort: 'intitule', direction: 'asc' }),
    enabled: ouverte,
  })

  useEffect(() => {
    if (!ouverte) return
    setEtape(0)
    setPhoto(null)
    if (etudiant) {
      reset({
        nom: etudiant.nom ?? '',
        prenom: etudiant.prenom ?? '',
        sexe: etudiant.sexe ?? '',
        date_naissance: etudiant.date_naissance ?? '',
        lieu_naissance: etudiant.lieu_naissance ?? '',
        email: etudiant.email ?? '',
        telephone: etudiant.telephone ?? '',
        adresse: etudiant.adresse ?? '',
        ville: etudiant.ville ?? '',
        pays: etudiant.pays ?? 'Bénin',
        statut: etudiant.statut ?? 'actif',
        date_inscription: etudiant.date_inscription ?? new Date().toISOString().slice(0, 10),
        formation_id: '',
      })
    } else {
      reset({
        nom: '',
        prenom: '',
        sexe: '',
        date_naissance: '',
        lieu_naissance: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: 'Bénin',
        statut: 'actif',
        date_inscription: new Date().toISOString().slice(0, 10),
        formation_id: '',
      })
    }
  }, [ouverte, etudiant, reset])

  // Protection contre la perte de données non enregistrées
  useEffect(() => {
    if (!ouverte) return
    function avertir(e) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [ouverte, isDirty])

  function demanderFermeture(prochain) {
    if (!prochain && isDirty) {
      const confirme = window.confirm('Des modifications non enregistrées seront perdues. Continuer ?')
      if (!confirme) return
    }
    onOpenChange(prochain)
  }

  const mutation = useMutation({
    mutationFn: async (donnees) => {
      const formulaire = new FormData()
      Object.entries(donnees).forEach(([cle, valeur]) => {
        if (valeur === undefined || valeur === null) return
        if (cle === 'formation_id' && !valeur) return
        formulaire.append(cle, valeur)
      })
      if (photo) formulaire.append('photo', photo)

      if (modeEdition) {
        formulaire.append('_method', 'PUT')
        return etudiantsService.modifierFormData(etudiant.id, formulaire)
      }
      return etudiantsService.creerFormData(formulaire)
    },
    onSuccess: (reponse) => {
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success(modeEdition ? 'Étudiant mis à jour' : 'Étudiant créé', {
        description: reponse?.etudiant?.prenom
          ? `${reponse.etudiant.prenom} ${reponse.etudiant.nom} a bien été enregistré.`
          : undefined,
      })
      onOpenChange(false)
      onSucces?.(reponse?.etudiant)
    },
    onError: (erreur) => {
      if (erreur.statut === 422 && erreur.erreurs) {
        let premiereEtape = null
        Object.entries(erreur.erreurs).forEach(([champ, messages]) => {
          setError(champ, { message: messages[0] })
          const index = ETAPES.findIndex((e) => e.champs.includes(champ))
          if (index >= 0 && (premiereEtape === null || index < premiereEtape)) premiereEtape = index
        })
        if (premiereEtape !== null) setEtape(premiereEtape)
        toast.error('Formulaire invalide', { description: 'Vérifiez les champs signalés.' })
      } else {
        toast.error('Enregistrement impossible', { description: erreur.message })
      }
    },
  })

  async function suivant() {
    const valide = await trigger(ETAPES[etape].champs, { shouldFocus: true })
    if (valide) setEtape((valeur) => Math.min(valeur + 1, ETAPES.length - 1))
  }

  function precedent() {
    setEtape((valeur) => Math.max(valeur - 1, 0))
  }

  const progression = useMemo(() => Math.round(((etape + 1) / ETAPES.length) * 100), [etape])
  const sexe = watch('sexe')
  const statut = watch('statut')
  const formationId = watch('formation_id')

  return (
    <Dialog open={ouverte} onOpenChange={demanderFermeture}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modeEdition ? "Modifier l'étudiant" : 'Nouvel étudiant'}</DialogTitle>
          <DialogDescription>
            {modeEdition
              ? 'Mettez à jour les informations du dossier étudiant.'
              : 'Complétez les étapes pour créer un dossier étudiant complet.'}
          </DialogDescription>
        </DialogHeader>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {ETAPES.map((e, index) => (
              <div key={e.titre} className="flex flex-1 items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    index < etape && 'bg-primary text-primary-foreground',
                    index === etape && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                    index > etape && 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < etape ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    index === etape ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {e.titre}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progression} />
        </div>

        <form onSubmit={handleSubmit((donnees) => mutation.mutate(donnees))} noValidate>
          <AnimatePresence mode="wait">
            <motion.div
              key={etape}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="min-h-[240px] space-y-4 py-2"
            >
              {etape === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input id="prenom" {...register('prenom')} aria-invalid={Boolean(errors.prenom)} />
                    <ErreurChamp message={errors.prenom?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input id="nom" {...register('nom')} aria-invalid={Boolean(errors.nom)} />
                    <ErreurChamp message={errors.nom?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sexe *</Label>
                    <Select value={sexe} onValueChange={(v) => setValue('sexe', v, { shouldValidate: true })}>
                      <SelectTrigger aria-invalid={Boolean(errors.sexe)}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErreurChamp message={errors.sexe?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date_naissance">Date de naissance *</Label>
                    <Input id="date_naissance" type="date" {...register('date_naissance')} aria-invalid={Boolean(errors.date_naissance)} />
                    <ErreurChamp message={errors.date_naissance?.message} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                    <Input id="lieu_naissance" {...register('lieu_naissance')} />
                    <ErreurChamp message={errors.lieu_naissance?.message} />
                  </div>
                </div>
              )}

              {etape === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email">Adresse e-mail *</Label>
                    <Input id="email" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />
                    <ErreurChamp message={errors.email?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" inputMode="tel" placeholder="+229 01 00 00 00" {...register('telephone')} />
                    <ErreurChamp message={errors.telephone?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" {...register('ville')} />
                    <ErreurChamp message={errors.ville?.message} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input id="adresse" {...register('adresse')} />
                    <ErreurChamp message={errors.adresse?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pays">Pays</Label>
                    <Input id="pays" {...register('pays')} />
                    <ErreurChamp message={errors.pays?.message} />
                  </div>
                </div>
              )}

              {etape === 2 && (
                <div className="space-y-4">
                  <PhotoUpload valeur={etudiant?.photo} onChange={setPhoto} nom={watch('nom') || 'etudiant'} />
                  <p className="text-center text-xs text-muted-foreground">
                    La photo est facultative. Vous pourrez l'ajouter plus tard.
                  </p>
                </div>
              )}

              {etape === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Statut</Label>
                    <Select value={statut} onValueChange={(v) => setValue('statut', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                        <SelectItem value="diplome">Diplômé</SelectItem>
                        <SelectItem value="abandon">Abandon</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErreurChamp message={errors.statut?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date_inscription">Date d'inscription *</Label>
                    <Input id="date_inscription" type="date" {...register('date_inscription')} />
                    <ErreurChamp message={errors.date_inscription?.message} />
                  </div>
                  {!modeEdition && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Inscription initiale à une formation</Label>
                      <Select
                        value={formationId ? String(formationId) : ''}
                        onValueChange={(v) => setValue('formation_id', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Aucune inscription pour l'instant" />
                        </SelectTrigger>
                        <SelectContent>
                          {formations?.data?.map((formation) => (
                            <SelectItem key={formation.id} value={String(formation.id)}>
                              {formation.code} — {formation.intitule}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErreurChamp message={errors.formation_id?.message} />
                      <p className="text-xs text-muted-foreground">
                        L'inscription sera créée avec le statut « En attente ».
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => demanderFermeture(false)}>
              Annuler
            </Button>
            <div className="flex gap-2">
              {etape > 0 && (
                <Button type="button" variant="outline" onClick={precedent}>
                  <ArrowLeft className="h-4 w-4" /> Précédent
                </Button>
              )}
              {etape < ETAPES.length - 1 ? (
                <Button type="button" onClick={suivant}>
                  Suivant <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {modeEdition ? 'Enregistrer' : "Créer l'étudiant"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
