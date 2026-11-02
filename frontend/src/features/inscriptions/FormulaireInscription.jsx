import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { inscriptionSchema } from '@/lib/schemas'
import { etudiantsService, formationsService, inscriptionsService } from '@/services/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatMontant } from '@/lib/utils'

export function FormulaireInscription({ ouverte, onOpenChange, inscription = null }) {
  const queryClient = useQueryClient()
  const modeEdition = Boolean(inscription)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      etudiant_id: '',
      formation_id: '',
      date_inscription: new Date().toISOString().slice(0, 10),
      statut: 'en_attente',
      note_finale: '',
      observations: '',
    },
  })

  const { data: etudiants } = useQuery({
    queryKey: ['etudiants-options'],
    queryFn: () => etudiantsService.liste({ per_page: 100, sort: 'nom', direction: 'asc' }),
    enabled: ouverte,
  })

  const { data: formations } = useQuery({
    queryKey: ['formations-options-capacite'],
    queryFn: () => formationsService.liste({ per_page: 100, sort: 'intitule', direction: 'asc', avec_inscriptions: 1 }),
    enabled: ouverte,
  })

  useEffect(() => {
    if (!ouverte) return
    reset({
      etudiant_id: inscription ? String(inscription.etudiant_id ?? '') : '',
      formation_id: inscription ? String(inscription.formation_id ?? '') : '',
      date_inscription: inscription?.date_inscription ?? new Date().toISOString().slice(0, 10),
      statut: inscription?.statut ?? 'en_attente',
      note_finale: inscription?.note_finale ?? '',
      observations: inscription?.observations ?? '',
    })
  }, [ouverte, inscription, reset])

  const mutation = useMutation({
    mutationFn: (donnees) => {
      const charge = {
        ...donnees,
        note_finale: donnees.note_finale === '' ? null : Number(donnees.note_finale),
        observations: donnees.observations || null,
      }
      return modeEdition
        ? inscriptionsService.modifier(inscription.id, charge)
        : inscriptionsService.creer(charge)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success(modeEdition ? 'Inscription mise à jour' : 'Inscription créée')
      onOpenChange(false)
    },
    onError: (erreur) => {
      if (erreur.statut === 422 && erreur.erreurs) {
        Object.entries(erreur.erreurs).forEach(([champ, messages]) => {
          setError(champ, { message: messages[0] })
        })
        toast.error('Inscription impossible', { description: 'Vérifiez les informations saisies.' })
      } else {
        toast.error('Enregistrement impossible', { description: erreur.message })
      }
    },
  })

  const etudiantId = watch('etudiant_id')
  const formationId = watch('formation_id')
  const statut = watch('statut')

  const formationSelectionnee = useMemo(
    () => formations?.data?.find((f) => String(f.id) === String(formationId)),
    [formations, formationId]
  )
  const placesRestantes = formationSelectionnee
    ? formationSelectionnee.capacite_max - (formationSelectionnee.inscriptions_count ?? 0)
    : null

  return (
    <Dialog open={ouverte} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{modeEdition ? "Modifier l'inscription" : 'Nouvelle inscription'}</DialogTitle>
          <DialogDescription>
            Rattachez un étudiant à une formation. La capacité maximale et les doublons sont contrôlés
            automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label>Étudiant *</Label>
            <Select
              value={etudiantId}
              onValueChange={(v) => setValue('etudiant_id', v, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={Boolean(errors.etudiant_id)}>
                <SelectValue placeholder="Sélectionner un étudiant" />
              </SelectTrigger>
              <SelectContent>
                {etudiants?.data?.map((etudiant) => (
                  <SelectItem key={etudiant.id} value={String(etudiant.id)}>
                    {etudiant.prenom} {etudiant.nom} — {etudiant.matricule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.etudiant_id && <p className="text-xs text-destructive">{errors.etudiant_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Formation *</Label>
            <Select
              value={formationId}
              onValueChange={(v) => setValue('formation_id', v, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={Boolean(errors.formation_id)}>
                <SelectValue placeholder="Sélectionner une formation" />
              </SelectTrigger>
              <SelectContent>
                {formations?.data?.map((formation) => (
                  <SelectItem key={formation.id} value={String(formation.id)}>
                    {formation.code} — {formation.intitule}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.formation_id && <p className="text-xs text-destructive">{errors.formation_id.message}</p>}
            {formationSelectionnee && (
              <p className="text-xs text-muted-foreground">
                {formatMontant(formationSelectionnee.prix)} ·{' '}
                {placesRestantes !== null && placesRestantes <= 0
                  ? 'Formation complète'
                  : `${placesRestantes} place(s) restante(s) sur ${formationSelectionnee.capacite_max}`}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date_inscription">Date d'inscription *</Label>
              <Input id="date_inscription" type="date" {...register('date_inscription')} />
              {errors.date_inscription && (
                <p className="text-xs text-destructive">{errors.date_inscription.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={(v) => setValue('statut', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
              {errors.statut && <p className="text-xs text-destructive">{errors.statut.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note_finale">Note finale (sur 20)</Label>
            <Input
              id="note_finale"
              type="number"
              min={0}
              max={20}
              step="0.01"
              placeholder="Ex : 15.5"
              {...register('note_finale')}
            />
            {errors.note_finale && <p className="text-xs text-destructive">{errors.note_finale.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observations">Observations</Label>
            <Textarea id="observations" rows={3} placeholder="Notes internes…" {...register('observations')} />
            {errors.observations && <p className="text-xs text-destructive">{errors.observations.message}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {modeEdition ? 'Enregistrer' : "Créer l'inscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
