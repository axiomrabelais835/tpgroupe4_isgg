import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { categorieSchema } from '@/lib/schemas'
import { categoriesService } from '@/services/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const COULEURS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#64748b',
]

export function FormulaireCategorie({ ouverte, onOpenChange, categorie = null }) {
  const queryClient = useQueryClient()
  const modeEdition = Boolean(categorie)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorieSchema),
    defaultValues: { nom: '', description: '', couleur: COULEURS[0] },
  })

  useEffect(() => {
    if (!ouverte) return
    reset({
      nom: categorie?.nom ?? '',
      description: categorie?.description ?? '',
      couleur: categorie?.couleur || COULEURS[0],
    })
  }, [ouverte, categorie, reset])

  const mutation = useMutation({
    mutationFn: (donnees) =>
      modeEdition ? categoriesService.modifier(categorie.id, donnees) : categoriesService.creer(donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-options'] })
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success(modeEdition ? 'Catégorie mise à jour' : 'Catégorie créée')
      onOpenChange(false)
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

  const couleur = watch('couleur')

  return (
    <Dialog open={ouverte} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{modeEdition ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          <DialogDescription>
            Regroupez vos formations par thématique pour mieux analyser votre catalogue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom *</Label>
            <Input id="nom" placeholder="Ex : Développement web" {...register('nom')} aria-invalid={Boolean(errors.nom)} />
            {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="Décrivez brièvement cette catégorie…" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Couleur d'identification</Label>
            <div className="flex flex-wrap items-center gap-2">
              {COULEURS.map((valeur) => (
                <button
                  key={valeur}
                  type="button"
                  onClick={() => setValue('couleur', valeur, { shouldValidate: true })}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    couleur === valeur ? 'border-foreground ring-2 ring-foreground/20' : 'border-transparent'
                  )}
                  style={{ backgroundColor: valeur }}
                  aria-label={`Couleur ${valeur}`}
                />
              ))}
              <div className="relative ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-dashed border-border">
                <input
                  type="color"
                  value={couleur || '#6366f1'}
                  onChange={(e) => setValue('couleur', e.target.value, { shouldValidate: true })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Couleur personnalisée"
                />
                <span className="pointer-events-none text-[10px] font-semibold text-muted-foreground">+</span>
              </div>
            </div>
            {errors.couleur && <p className="text-xs text-destructive">{errors.couleur.message}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {modeEdition ? 'Enregistrer' : 'Créer la catégorie'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
