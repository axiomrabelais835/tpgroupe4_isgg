import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Eye, Filter, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { etudiantsService } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/data-table/DataTable'
import { FiltresAvances, PucesFiltres } from '@/components/data-table/FiltresAvances'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormulaireEtudiant } from '@/features/etudiants/FormulaireEtudiant'
import { FicheEtudiant } from '@/features/etudiants/FicheEtudiant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, initiales } from '@/lib/utils'

const FILTRES_VIDES = {
  statut: '',
  sexe: '',
  ville: '',
  age_min: '',
  age_max: '',
  inscription_de: '',
  inscription_a: '',
}

export function EtudiantsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 350)
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_VIDES)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [page, setPage] = useState(1)
  const [tri, setTri] = useState({ sort: 'created_at', direction: 'desc' })
  const [selection, setSelection] = useState([])
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [etudiantAModifier, setEtudiantAModifier] = useState(null)
  const [etudiantASupprimer, setEtudiantASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  const ficheId = searchParams.get('fiche')
  const ficheOuverte = Boolean(ficheId)

  // Réinitialise la page quand les critères changent
  useEffect(() => {
    setPage(1)
    setSelection([])
  }, [rechercheDebouncee, filtresAppliques, tri.sort, tri.direction])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['etudiants', { page, rechercheDebouncee, filtresAppliques, tri }],
    queryFn: () =>
      etudiantsService.liste({
        page,
        per_page: 12,
        search: rechercheDebouncee,
        sort: tri.sort,
        direction: tri.direction,
        ...filtresAppliques,
      }),
  })

  const mutationSuppression = useMutation({
    mutationFn: (id) => etudiantsService.supprimer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success('Étudiant supprimé', {
        description: "La suppression peut être annulée pendant quelques instants.",
        action: {
          label: 'Annuler',
          onClick: async () => {
            try {
              await etudiantsService.restaurer(id)
              queryClient.invalidateQueries({ queryKey: ['etudiants'] })
              toast.success('Suppression annulée')
            } catch {
              toast.error("Impossible d'annuler la suppression.")
            }
          },
        },
      })
    },
    onError: (erreur) => toast.error('Suppression impossible', { description: erreur.message }),
  })

  async function confirmerSuppression() {
    if (!etudiantASupprimer) return
    setSuppressionEnCours(true)
    try {
      await mutationSuppression.mutateAsync(etudiantASupprimer.id)
      setEtudiantASupprimer(null)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  async function supprimerSelection() {
    if (selection.length === 0) return
    const confirme = window.confirm(`Supprimer ${selection.length} étudiant(s) ?`)
    if (!confirme) return
    let reussites = 0
    for (const id of selection) {
      try {
        await etudiantsService.supprimer(id)
        reussites += 1
      } catch {
        // continue
      }
    }
    setSelection([])
    queryClient.invalidateQueries({ queryKey: ['etudiants'] })
    toast.success(`${reussites} étudiant(s) supprimé(s)`)
  }

  async function exporterCsv() {
    try {
      const blob = await etudiantsService.exporter({ search: rechercheDebouncee, ...filtresAppliques })
      const url = URL.createObjectURL(blob)
      const lien = document.createElement('a')
      lien.href = url
      lien.download = `etudiants_${new Date().toISOString().slice(0, 10)}.csv`
      lien.click()
      URL.revokeObjectURL(url)
      toast.success('Export CSV généré')
    } catch (erreur) {
      toast.error("Export impossible", { description: erreur.message })
    }
  }

  function appliquerFiltres() {
    setFiltresAppliques(filtres)
    setFiltresOuverts(false)
  }

  function reinitialiserFiltres() {
    setFiltres(FILTRES_VIDES)
    setFiltresAppliques(FILTRES_VIDES)
  }

  const puces = useMemo(() => {
    const liste = []
    if (filtresAppliques.statut) {
      liste.push({ cle: 'statut', libelle: `Statut : ${filtresAppliques.statut}`, onSupprimer: () => majFiltre('statut', '') })
    }
    if (filtresAppliques.sexe) {
      liste.push({
        cle: 'sexe',
        libelle: `Sexe : ${filtresAppliques.sexe === 'M' ? 'Masculin' : 'Féminin'}`,
        onSupprimer: () => majFiltre('sexe', ''),
      })
    }
    if (filtresAppliques.ville) {
      liste.push({ cle: 'ville', libelle: `Ville : ${filtresAppliques.ville}`, onSupprimer: () => majFiltre('ville', '') })
    }
    if (filtresAppliques.age_min || filtresAppliques.age_max) {
      liste.push({
        cle: 'age',
        libelle: `Âge : ${filtresAppliques.age_min || 0}–${filtresAppliques.age_max || '∞'} ans`,
        onSupprimer: () => {
          const suivant = { ...filtresAppliques, age_min: '', age_max: '' }
          setFiltres(suivant)
          setFiltresAppliques(suivant)
        },
      })
    }
    if (filtresAppliques.inscription_de || filtresAppliques.inscription_a) {
      liste.push({
        cle: 'dates',
        libelle: `Inscription : ${filtresAppliques.inscription_de || '…'} → ${filtresAppliques.inscription_a || '…'}`,
        onSupprimer: () => {
          const suivant = { ...filtresAppliques, inscription_de: '', inscription_a: '' }
          setFiltres(suivant)
          setFiltresAppliques(suivant)
        },
      })
    }
    return liste
  }, [filtresAppliques])

  function majFiltre(cle, valeur) {
    const suivant = { ...filtresAppliques, [cle]: valeur }
    setFiltres(suivant)
    setFiltresAppliques(suivant)
  }

  function ouvrirFiche(id) {
    setSearchParams({ fiche: String(id) })
  }

  function ouvrirFormulaire(etudiant = null) {
    setEtudiantAModifier(etudiant)
    setSearchParams({})
    setFormulaireOuvert(true)
  }

  function fermerFiche(ouvert) {
    if (!ouvert) setSearchParams({})
  }

  const colonnes = [
    {
      cle: 'etudiant',
      titre: 'Étudiant',
      triable: false,
      rendre: (etudiant) => (
        <button onClick={() => ouvrirFiche(etudiant.id)} className="flex items-center gap-2.5 text-left">
          <Avatar className="h-8 w-8">
            <AvatarImage src={etudiant.photo || undefined} alt="" />
            <AvatarFallback className="text-[10px]">{initiales(etudiant.prenom, etudiant.nom)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium hover:underline">
              {etudiant.prenom} {etudiant.nom}
            </span>
            <span className="block font-mono text-[11px] text-muted-foreground">{etudiant.matricule}</span>
          </span>
        </button>
      ),
    },
    { cle: 'email', titre: 'E-mail', triable: true, className: 'hidden lg:table-cell', rendre: (e) => <span className="text-xs">{e.email}</span> },
    { cle: 'telephone', titre: 'Téléphone', triable: false, className: 'hidden xl:table-cell', rendre: (e) => <span className="text-xs">{e.telephone || '—'}</span> },
    { cle: 'ville', titre: 'Ville', triable: false, className: 'hidden md:table-cell', rendre: (e) => <span className="text-xs">{e.ville || '—'}</span> },
    { cle: 'statut', titre: 'Statut', triable: false, rendre: (e) => <StatusBadge statut={e.statut} /> },
    {
      cle: 'date_inscription',
      titre: 'Inscrit le',
      triable: true,
      className: 'hidden sm:table-cell',
      rendre: (e) => <span className="text-xs text-muted-foreground">{formatDate(e.date_inscription)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        titre="Étudiants"
        description="Gérez les dossiers étudiants, leurs coordonnées et leurs parcours."
        icone={Users}
        actions={
          <>
            <Button variant="outline" onClick={exporterCsv}>
              <Download className="h-4 w-4" /> Exporter CSV
            </Button>
            <Button onClick={() => ouvrirFormulaire()}>
              <Plus className="h-4 w-4" /> Nouvel étudiant
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, matricule, e-mail, téléphone, ville…"
              className="pl-9"
              aria-label="Rechercher un étudiant"
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
            <Filter className="h-4 w-4" />
            Filtres
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
        selection={selection}
        onSelectionChange={setSelection}
        actionsGroupees={
          <Button variant="destructive" size="sm" onClick={supprimerSelection}>
            <Trash2 className="h-4 w-4" /> Supprimer ({selection.length})
          </Button>
        }
        vide={
          <EmptyState
            icone={Users}
            titre="Aucun étudiant trouvé"
            description="Ajustez vos filtres ou créez un nouvel étudiant."
            action={
              <Button onClick={() => ouvrirFormulaire()}>
                <Plus className="h-4 w-4" /> Nouvel étudiant
              </Button>
            }
          />
        }
        actionsLignes={(etudiant) => (
          <>
            <button
              onClick={() => ouvrirFiche(etudiant.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> Voir la fiche
            </button>
            <button
              onClick={() => ouvrirFormulaire(etudiant)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button
              onClick={() => setEtudiantASupprimer(etudiant)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </>
        )}
      />

      {isFetching && !isLoading && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Actualisation…</p>
      )}

      <FormulaireEtudiant
        ouverte={formulaireOuvert}
        onOpenChange={(ouvert) => {
          setFormulaireOuvert(ouvert)
          if (!ouvert) setEtudiantAModifier(null)
        }}
        etudiant={etudiantAModifier}
        onSucces={(etudiant) => {
          if (etudiant?.id) ouvrirFiche(etudiant.id)
        }}
      />

      <FicheEtudiant
        ouverte={ficheOuverte}
        onOpenChange={fermerFiche}
        etudiantId={ficheId}
        onModifier={(etudiant) => {
          ouvrirFormulaire(etudiant)
        }}
      />

      <ConfirmDialog
        ouverte={Boolean(etudiantASupprimer)}
        onOpenChange={(ouvert) => !ouvert && setEtudiantASupprimer(null)}
        titre="Supprimer cet étudiant ?"
        description="Cette action retire l'étudiant de la liste. Une annulation reste possible via le toast."
        element={etudiantASupprimer ? `${etudiantASupprimer.prenom} ${etudiantASupprimer.nom} — ${etudiantASupprimer.matricule}` : null}
        onConfirmer={confirmerSuppression}
        chargement={suppressionEnCours}
      />

      <FiltresAvances
        ouverte={filtresOuverts}
        onOpenChange={setFiltresOuverts}
        titre="Filtrer les étudiants"
        onReinitialiser={() => {
          reinitialiserFiltres()
          setFiltresOuverts(false)
        }}
        onAppliquer={appliquerFiltres}
      >
        <div className="space-y-1.5">
          <Label>Statut</Label>
          <Select value={filtres.statut} onValueChange={(v) => setFiltres({ ...filtres, statut: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
              <SelectItem value="diplome">Diplômé</SelectItem>
              <SelectItem value="abandon">Abandon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Sexe</Label>
          <Select value={filtres.sexe} onValueChange={(v) => setFiltres({ ...filtres, sexe: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ville">Ville</Label>
          <Input
            id="ville"
            value={filtres.ville}
            onChange={(e) => setFiltres({ ...filtres, ville: e.target.value })}
            placeholder="Ex : Dakar"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="age_min">Âge minimum</Label>
            <Input
              id="age_min"
              type="number"
              min={0}
              value={filtres.age_min}
              onChange={(e) => setFiltres({ ...filtres, age_min: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age_max">Âge maximum</Label>
            <Input
              id="age_max"
              type="number"
              min={0}
              value={filtres.age_max}
              onChange={(e) => setFiltres({ ...filtres, age_max: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="inscription_de">Inscrit du</Label>
            <Input
              id="inscription_de"
              type="date"
              value={filtres.inscription_de}
              onChange={(e) => setFiltres({ ...filtres, inscription_de: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inscription_a">Au</Label>
            <Input
              id="inscription_a"
              type="date"
              value={filtres.inscription_a}
              onChange={(e) => setFiltres({ ...filtres, inscription_a: e.target.value })}
            />
          </div>
        </div>
      </FiltresAvances>
    </div>
  )
}
