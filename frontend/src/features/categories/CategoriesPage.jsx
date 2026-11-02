import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Layers, Pencil, Plus, Search, Tags, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesService } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormulaireCategorie } from '@/features/categories/FormulaireCategorie'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 350)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [categorieAModifier, setCategorieAModifier] = useState(null)
  const [categorieASupprimer, setCategorieASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['categories', rechercheDebouncee],
    queryFn: () => categoriesService.liste({ search: rechercheDebouncee, per_page: 100, sort: 'nom', direction: 'asc' }),
  })

  const categories = data?.data ?? []
  const totalFormations = categories.reduce((somme, c) => somme + (c.formations_count ?? 0), 0)

  async function supprimer() {
    if (!categorieASupprimer) return
    setSuppressionEnCours(true)
    try {
      await categoriesService.supprimer(categorieASupprimer.id)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-options'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success('Catégorie supprimée')
      setCategorieASupprimer(null)
    } catch (erreur) {
      toast.error('Suppression impossible', {
        description: erreur.erreurs?.categorie?.[0] || erreur.message,
      })
      setCategorieASupprimer(null)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  return (
    <div>
      <PageHeader
        titre="Catégories"
        description="Organisez votre catalogue de formations par thématique."
        icone={Tags}
        actions={
          <Button
            onClick={() => {
              setCategorieAModifier(null)
              setFormulaireOuvert(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nouvelle catégorie
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <CarteResume icone={Tags} libelle="Catégories" valeur={data?.meta?.total ?? categories.length} />
        <CarteResume icone={GraduationCap} libelle="Formations rattachées" valeur={totalFormations} />
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une catégorie…"
          className="pl-9"
          aria-label="Rechercher une catégorie"
        />
        {recherche && (
          <button
            onClick={() => setRecherche('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
              <Skeleton className="mb-2 h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <EmptyState
          icone={Tags}
          titre="Aucune catégorie"
          description="Créez une première catégorie pour classer vos formations."
          action={
            <Button onClick={() => setFormulaireOuvert(true)}>
              <Plus className="h-4 w-4" /> Nouvelle catégorie
            </Button>
          }
        />
      )}

      {!isLoading && categories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((categorie) => {
            const couleur = categorie.couleur || '#6366f1'
            return (
              <article
                key={categorie.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: couleur }} aria-hidden="true" />

                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${couleur}1f`, color: couleur }}
                  >
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setCategorieAModifier(categorie)
                        setFormulaireOuvert(true)
                      }}
                      aria-label={`Modifier ${categorie.nom}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setCategorieASupprimer(categorie)}
                      aria-label={`Supprimer ${categorie.nom}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <h3 className="mt-3 truncate text-sm font-semibold">{categorie.nom}</h3>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                  {categorie.description || 'Aucune description renseignée.'}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {categorie.formations_count ?? 0} formation(s)
                  </span>
                  <span
                    className={cn('h-2 w-2 rounded-full')}
                    style={{ backgroundColor: couleur }}
                    aria-hidden="true"
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      <FormulaireCategorie
        ouverte={formulaireOuvert}
        onOpenChange={(ouvert) => {
          setFormulaireOuvert(ouvert)
          if (!ouvert) setCategorieAModifier(null)
        }}
        categorie={categorieAModifier}
      />

      <ConfirmDialog
        ouverte={Boolean(categorieASupprimer)}
        onOpenChange={(ouvert) => !ouvert && setCategorieASupprimer(null)}
        titre="Supprimer cette catégorie ?"
        description="La suppression est refusée si la catégorie contient encore des formations."
        element={categorieASupprimer ? categorieASupprimer.nom : null}
        onConfirmer={supprimer}
        chargement={suppressionEnCours}
      />
    </div>
  )
}

function CarteResume({ icone: Icone, libelle, valeur }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icone className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{libelle}</p>
        <p className="text-lg font-bold leading-tight">{valeur}</p>
      </div>
    </div>
  )
}
