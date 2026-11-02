import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formationSchema } from '@/lib/schemas'
import { categoriesService, formationsService } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function ErreurChamp({ message }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export function FormulaireFormation({ ouverte, onOpenChange, formation = null, onSucces }) {
  const queryClient = useQueryClient()
  const modeEdition = Boolean(formation)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      categorie_formation_id: '',
      code: '',
      intitule: '',
      description: '',
      duree_heures: 40,
      prix: 0,
      niveau: 'debutant',
      capacite_max: 20,
      date_debut: new Date().toISOString().slice(0, 10),
      date_fin: '',
      statut: 'planifiee',
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-options'],
    queryFn: () => categoriesService.liste({ per_page: 100 }),
    enabled: ouverte,
  })

  useEffect(() => {
    if (!ouverte) return
    reset(
      formation
        ? {
            categorie_formation_id: String(formation.categorie_formation_id ?? ''),
            code: formation.code ?? '',
            intitule: formation.intitule ?? '',
            description: formation.description ?? '',
            duree_heures: formation.duree_heures ?? 40,
            prix: Number(formation.prix ?? 0),
            niveau: formation.niveau ?? 'debutant',
            capacite_max: formation.capacite_max ?? 20,
            date_debut: formation.date_debut ?? new Date().toISOString().slice(0, 10),
            date_fin: formation.date_fin ?? '',
            statut: formation.statut ?? 'planifiee',
          }
        : {
            categorie_formation_id: '',
            code: '',
            intitule: '',
            description: '',
            duree_heures: 40,
            prix: 0,
            niveau: 'debutant',
            capacite_max: 20,
            date_debut: new Date().toISOString().slice(0, 10),
            date_fin: '',
            statut: 'planifiee',
          }
    )
  }, [ouverte, formation, reset])

  const mutation = useMutation({
    mutationFn: (donnees) => {
      const charge = { ...donnees, prix: Number(donnees.prix), duree_heures: Number(donnees.duree_heures), capacite_max: Number(donnees.capacite_max) }
      return modeEdition ? formationsService.modifier(formation.id, charge) : formationsService.creer(charge)
    },
    onSuccess: (reponse) => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success(modeEdition ? 'Formation mise à jour' : 'Formation créée', {
        description: reponse?.formation?.intitule,
      })
      onOpenChange(false)
      onSucces?.(reponse?.formation)
    },
    onError: (erreur) => {
      if (erreur.statut === 422 && erreur.erreurs) {
        Object.entries(erreur.erreurs).forEach(([champ, messages]) => {
          setError(champ, { message: messages[0] })
        })
        toast.error('Formulaire invalide', { description: 'Vérifiez les champs signalés.' })
      } else {
        toast.error('Enregistrement impossible', { description: erreur.message })
      }
    },
  })

  const niveau = watch('niveau')
  const statut = watch('statut')
  const categorie = watch('categorie_formation_id')

  return (
    <Dialog open={ouverte} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{modeEdition ? 'Modifier la formation' : 'Nouvelle formation'}</DialogTitle>
          <DialogDescription>Renseignez les informations pédagogiques et logistiques.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <Select value={categorie} onValueChange={(v) => setValue('categorie_formation_id', v, { shouldValidate: true })}>
                <SelectTrigger aria-invalid={Boolean(errors.categorie_formation_id)}>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.data?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.couleur }} />
                        {cat.nom}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErreurChamp message={errors.categorie_formation_id?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" placeholder="WEB-101" {...register('code')} aria-invalid={Boolean(errors.code)} />
              <ErreurChamp message={errors.code?.message} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="intitule">Intitulé *</Label>
              <Input id="intitule" {...register('intitule')} aria-invalid={Boolean(errors.intitule)} />
              <ErreurChamp message={errors.intitule?.message} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register('description')} />
              <ErreurChamp message={errors.description?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duree_heures">Durée (heures) *</Label>
              <Input id="duree_heures" type="number" min={1} {...register('duree_heures')} />
              <ErreurChamp message={errors.duree_heures?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prix">Prix (FCFA) *</Label>
              <Input id="prix" type="number" min={0} step="0.01" {...register('prix')} />
              <ErreurChamp message={errors.prix?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Niveau *</Label>
              <Select value={niveau} onValueChange={(v) => setValue('niveau', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debutant">Débutant</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="avance">Avancé</SelectItem>
                </SelectContent>
              </Select>
              <ErreurChamp message={errors.niveau?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacite_max">Capacité maximale *</Label>
              <Input id="capacite_max" type="number" min={1} {...register('capacite_max')} />
              <ErreurChamp message={errors.capacite_max?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_debut">Date de début *</Label>
              <Input id="date_debut" type="date" {...register('date_debut')} />
              <ErreurChamp message={errors.date_debut?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_fin">Date de fin</Label>
              <Input id="date_fin" type="date" {...register('date_fin')} />
              <ErreurChamp message={errors.date_fin?.message} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={(v) => setValue('statut', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifiee">Planifiée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {modeEdition ? 'Enregistrer' : 'Créer la formation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
