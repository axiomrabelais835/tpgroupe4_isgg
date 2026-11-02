import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Filter, GraduationCap, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesService, formationsService } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/data-table/DataTable'
import { FiltresAvances, PucesFiltres } from '@/components/data-table/FiltresAvances'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormulaireFormation } from '@/features/formations/FormulaireFormation'
import { FicheFormation } from '@/features/formations/FicheFormation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, formatMontant } from '@/lib/utils'

const FILTRES_VIDES = { statut: '', niveau: '', categorie_formation_id: '', debut_de: '', debut_a: '' }

export function FormationsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 350)
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_VIDES)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [page, setPage] = useState(1)
  const [tri, setTri] = useState({ sort: 'created_at', direction: 'desc' })
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [formationAModifier, setFormationAModifier] = useState(null)
  const [formationASupprimer, setFormationASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  const ficheId = searchParams.get('fiche')

  useEffect(() => {
    setPage(1)
  }, [rechercheDebouncee, filtresAppliques, tri.sort, tri.direction])

  const { data, isLoading } = useQuery({
    queryKey: ['formations', { page, rechercheDebouncee, filtresAppliques, tri }],
    queryFn: () =>
      formationsService.liste({
        page,
        per_page: 12,
        search: rechercheDebouncee,
        sort: tri.sort,
        direction: tri.direction,
        avec_inscriptions: 1,
        ...filtresAppliques,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-options'],
    queryFn: () => categoriesService.liste({ per_page: 100 }),
  })

  async function supprimer() {
    if (!formationASupprimer) return
    setSuppressionEnCours(true)
    try {
      await formationsService.supprimer(formationASupprimer.id)
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success('Formation supprimée')
      setFormationASupprimer(null)
    } catch (erreur) {
      toast.error('Suppression impossible', {
        description: erreur.erreurs?.formation?.[0] || erreur.message,
      })
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const puces = useMemo(() => {
    const liste = []
    if (filtresAppliques.statut) liste.push({ cle: 'statut', libelle: `Statut : ${filtresAppliques.statut}`, onSupprimer: () => majFiltre('statut', '') })
    if (filtresAppliques.niveau) liste.push({ cle: 'niveau', libelle: `Niveau : ${filtresAppliques.niveau}`, onSupprimer: () => majFiltre('niveau', '') })
    if (filtresAppliques.categorie_formation_id) {
      const cat = categories?.data?.find((c) => String(c.id) === String(filtresAppliques.categorie_formation_id))
      liste.push({
        cle: 'categorie',
        libelle: `Catégorie : ${cat?.nom ?? '…'}`,
        onSupprimer: () => majFiltre('categorie_formation_id', ''),
      })
    }
    if (filtresAppliques.debut_de || filtresAppliques.debut_a) {
      liste.push({
        cle: 'dates',
        libelle: `Début : ${filtresAppliques.debut_de || '…'} → ${filtresAppliques.debut_a || '…'}`,
        onSupprimer: () => {
          const suivant = { ...filtresAppliques, debut_de: '', debut_a: '' }
          setFiltres(suivant)
          setFiltresAppliques(suivant)
        },
      })
    }
    return liste
  }, [filtresAppliques, categories])

  function majFiltre(cle, valeur) {
    const suivant = { ...filtresAppliques, [cle]: valeur }
    setFiltres(suivant)
    setFiltresAppliques(suivant)
  }

  const colonnes = [
    {
      cle: 'intitule',
      titre: 'Formation',
      triable: true,
      rendre: (formation) => (
        <button onClick={() => setSearchParams({ fiche: String(formation.id) })} className="text-left">
          <span className="block max-w-[260px] truncate text-sm font-medium hover:underline">{formation.intitule}</span>
          <span className="block font-mono text-[11px] text-muted-foreground">{formation.code}</span>
        </button>
      ),
    },
    {
      cle: 'categorie',
      titre: 'Catégorie',
      triable: false,
      className: 'hidden lg:table-cell',
      rendre: (formation) => (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: formation.categorie?.couleur }} />
          {formation.categorie?.nom}
        </span>
      ),
    },
    {
      cle: 'niveau',
      titre: 'Niveau',
      triable: false,
      className: 'hidden md:table-cell',
      rendre: (formation) => <StatusBadge statut={formation.niveau} />,
    },
    {
      cle: 'remplissage',
      titre: 'Remplissage',
      triable: false,
      rendre: (formation) => {
        const inscrits = formation.inscriptions_count ?? 0
        const pourcentage = formation.capacite_max ? Math.round((inscrits / formation.capacite_max) * 100) : 0
        return (
          <div className="w-28">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>
                {inscrits}/{formation.capacite_max}
              </span>
              <span>{pourcentage} %</span>
            </div>
            <Progress
              value={Math.min(100, pourcentage)}
              className="h-1.5"
              indicateurClassName={pourcentage >= 90 ? 'bg-red-500' : pourcentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}
            />
          </div>
        )
      },
    },
    { cle: 'prix', titre: 'Prix', triable: true, className: 'hidden xl:table-cell', rendre: (f) => <span className="text-xs font-medium">{formatMontant(f.prix)}</span> },
    { cle: 'statut', titre: 'Statut', triable: false, rendre: (f) => <StatusBadge statut={f.statut} /> },
    {
      cle: 'date_debut',
      titre: 'Début',
      triable: true,
      className: 'hidden sm:table-cell',
      rendre: (f) => <span className="text-xs text-muted-foreground">{formatDate(f.date_debut)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        titre="Formations"
        description="Pilotez votre catalogue, les capacités et les plannings."
        icone={GraduationCap}
        actions={
          <Button
            onClick={() => {
              setFormationAModifier(null)
              setFormulaireOuvert(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nouvelle formation
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par code, intitulé…"
              className="pl-9"
              aria-label="Rechercher une formation"
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
          <Button variant="outline" onClick={() => setFiltresOuverts(true)} className="gap-2">
            <Filter className="h-4 w-4" /> Filtres
            {puces.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {puces.length}
              </span>
            )}
          </Button>
        </div>
        <PucesFiltres puces={puces} />
      </div>

      <DataTable
        colonnes={colonnes}
        donnees={data?.data ?? []}
        chargement={isLoading}
        tri={tri}
        onTriChange={(sort, direction) => setTri({ sort, direction })}
        pagination={data?.meta}
        onPageChange={setPage}
        vide={
          <EmptyState
            icone={GraduationCap}
            titre="Aucune formation"
            description="Créez votre première formation pour commencer."
            action={
              <Button onClick={() => setFormulaireOuvert(true)}>
                <Plus className="h-4 w-4" /> Nouvelle formation
              </Button>
            }
          />
        }
        actionsLignes={(formation) => (
          <>
            <button
              onClick={() => setSearchParams({ fiche: String(formation.id) })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> Voir la fiche
            </button>
            <button
              onClick={() => {
                setFormationAModifier(formation)
                setFormulaireOuvert(true)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button
              onClick={() => setFormationASupprimer(formation)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </>
        )}
      />

      <FormulaireFormation
        ouverte={formulaireOuvert}
        onOpenChange={(ouvert) => {
          setFormulaireOuvert(ouvert)
          if (!ouvert) setFormationAModifier(null)
        }}
        formation={formationAModifier}
      />

      <FicheFormation
        ouverte={Boolean(ficheId)}
        onOpenChange={(ouvert) => !ouvert && setSearchParams({})}
        formationId={ficheId}
        onModifier={(formation) => {
          setFormationAModifier(formation)
          setFormulaireOuvert(true)
        }}
      />

      <ConfirmDialog
        ouverte={Boolean(formationASupprimer)}
        onOpenChange={(ouvert) => !ouvert && setFormationASupprimer(null)}
        titre="Supprimer cette formation ?"
        description="La suppression est refusée si des inscriptions actives existent."
        element={formationASupprimer ? `${formationASupprimer.code} — ${formationASupprimer.intitule}` : null}
        onConfirmer={supprimer}
        chargement={suppressionEnCours}
      />

      <FiltresAvances
        ouverte={filtresOuverts}
        onOpenChange={setFiltresOuverts}
        titre="Filtrer les formations"
        onReinitialiser={() => {
          setFiltres(FILTRES_VIDES)
          setFiltresAppliques(FILTRES_VIDES)
          setFiltresOuverts(false)
        }}
        onAppliquer={() => {
          setFiltresAppliques(filtres)
          setFiltresOuverts(false)
        }}
      >
        <div className="space-y-1.5">
          <Label>Statut</Label>
          <Select value={filtres.statut} onValueChange={(v) => setFiltres({ ...filtres, statut: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planifiee">Planifiée</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="terminee">Terminée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Niveau</Label>
          <Select value={filtres.niveau} onValueChange={(v) => setFiltres({ ...filtres, niveau: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debutant">Débutant</SelectItem>
              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
              <SelectItem value="avance">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Catégorie</Label>
          <Select
            value={String(filtres.categorie_formation_id || '')}
            onValueChange={(v) => setFiltres({ ...filtres, categorie_formation_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              {categories?.data?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="debut_de">Début du</Label>
            <Input
              id="debut_de"
              type="date"
              value={filtres.debut_de}
              onChange={(e) => setFiltres({ ...filtres, debut_de: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debut_a">Au</Label>
            <Input
              id="debut_a"
              type="date"
              value={filtres.debut_a}
              onChange={(e) => setFiltres({ ...filtres, debut_a: e.target.value })}
            />
          </div>
        </div>
      </FiltresAvances>
    </div>
  )
}
