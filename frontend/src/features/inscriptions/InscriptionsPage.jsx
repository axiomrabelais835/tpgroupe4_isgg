import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Filter, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { formationsService, inscriptionsService } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/data-table/DataTable'
import { FiltresAvances, PucesFiltres } from '@/components/data-table/FiltresAvances'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormulaireInscription } from '@/features/inscriptions/FormulaireInscription'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, initiales } from '@/lib/utils'

const FILTRES_VIDES = {
  statut: '',
  formation_id: '',
  inscription_de: '',
  inscription_a: '',
}

export function InscriptionsPage() {
  const queryClient = useQueryClient()
  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 350)
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_VIDES)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [page, setPage] = useState(1)
  const [tri, setTri] = useState({ sort: 'date_inscription', direction: 'desc' })
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [inscriptionAModifier, setInscriptionAModifier] = useState(null)
  const [inscriptionASupprimer, setInscriptionASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [rechercheDebouncee, filtresAppliques, tri.sort, tri.direction])

  const { data, isLoading } = useQuery({
    queryKey: ['inscriptions', { page, rechercheDebouncee, filtresAppliques, tri }],
    queryFn: () =>
      inscriptionsService.liste({
        page,
        per_page: 12,
        search: rechercheDebouncee,
        sort: tri.sort,
        direction: tri.direction,
        ...filtresAppliques,
      }),
  })

  const { data: formations } = useQuery({
    queryKey: ['formations-options'],
    queryFn: () => formationsService.liste({ per_page: 100, sort: 'intitule', direction: 'asc' }),
  })

  async function supprimer() {
    if (!inscriptionASupprimer) return
    setSuppressionEnCours(true)
    try {
      await inscriptionsService.supprimer(inscriptionASupprimer.id)
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success('Inscription supprimée')
      setInscriptionASupprimer(null)
    } catch (erreur) {
      toast.error('Suppression impossible', { description: erreur.message })
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const puces = useMemo(() => {
    const liste = []
    if (filtresAppliques.statut) {
      liste.push({
        cle: 'statut',
        libelle: `Statut : ${filtresAppliques.statut.replace('_', ' ')}`,
        onSupprimer: () => majFiltre('statut', ''),
      })
    }
    if (filtresAppliques.formation_id) {
      const formation = formations?.data?.find((f) => String(f.id) === String(filtresAppliques.formation_id))
      liste.push({
        cle: 'formation',
        libelle: `Formation : ${formation?.code ?? '…'}`,
        onSupprimer: () => majFiltre('formation_id', ''),
      })
    }
    if (filtresAppliques.inscription_de || filtresAppliques.inscription_a) {
      liste.push({
        cle: 'dates',
        libelle: `Du ${filtresAppliques.inscription_de || '…'} au ${filtresAppliques.inscription_a || '…'}`,
        onSupprimer: () => {
          const suivant = { ...filtresAppliques, inscription_de: '', inscription_a: '' }
          setFiltres(suivant)
          setFiltresAppliques(suivant)
        },
      })
    }
    return liste
  }, [filtresAppliques, formations])

  function majFiltre(cle, valeur) {
    const suivant = { ...filtresAppliques, [cle]: valeur }
    setFiltres(suivant)
    setFiltresAppliques(suivant)
  }

  const colonnes = [
    {
      cle: 'etudiant',
      titre: 'Étudiant',
      triable: false,
      rendre: (inscription) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={inscription.etudiant?.photo || undefined} alt="" />
            <AvatarFallback className="text-[10px]">
              {initiales(inscription.etudiant?.prenom, inscription.etudiant?.nom)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
            </span>
            <span className="block font-mono text-[11px] text-muted-foreground">
              {inscription.etudiant?.matricule}
            </span>
          </span>
        </div>
      ),
    },
    {
      cle: 'formation',
      titre: 'Formation',
      triable: false,
      rendre: (inscription) => (
        <div className="max-w-[240px]">
          <p className="truncate text-sm">{inscription.formation?.intitule}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{inscription.formation?.code}</p>
        </div>
      ),
    },
    {
      cle: 'date_inscription',
      titre: "Date d'inscription",
      triable: true,
      className: 'hidden md:table-cell',
      rendre: (i) => <span className="text-xs text-muted-foreground">{formatDate(i.date_inscription)}</span>,
    },
    { cle: 'statut', titre: 'Statut', triable: false, rendre: (i) => <StatusBadge statut={i.statut} /> },
    {
      cle: 'note_finale',
      titre: 'Note',
      triable: true,
      className: 'hidden sm:table-cell',
      rendre: (i) => (
        <span className="text-xs font-medium">{i.note_finale !== null ? `${i.note_finale}/20` : '—'}</span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        titre="Inscriptions"
        description="Suivez les inscriptions aux formations et les résultats pédagogiques."
        icone={ClipboardList}
        actions={
          <Button
            onClick={() => {
              setInscriptionAModifier(null)
              setFormulaireOuvert(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nouvelle inscription
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
              placeholder="Rechercher par étudiant, matricule ou formation…"
              className="pl-9"
              aria-label="Rechercher une inscription"
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
            icone={ClipboardList}
            titre="Aucune inscription"
            description="Créez une inscription ou ajustez vos critères de recherche."
            action={
              <Button onClick={() => setFormulaireOuvert(true)}>
                <Plus className="h-4 w-4" /> Nouvelle inscription
              </Button>
            }
          />
        }
        actionsLignes={(inscription) => (
          <>
            <button
              onClick={() => {
                setInscriptionAModifier(inscription)
                setFormulaireOuvert(true)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button
              onClick={() => setInscriptionASupprimer(inscription)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </>
        )}
      />

      <FormulaireInscription
        ouverte={formulaireOuvert}
        onOpenChange={(ouvert) => {
          setFormulaireOuvert(ouvert)
          if (!ouvert) setInscriptionAModifier(null)
        }}
        inscription={inscriptionAModifier}
      />

      <ConfirmDialog
        ouverte={Boolean(inscriptionASupprimer)}
        onOpenChange={(ouvert) => !ouvert && setInscriptionASupprimer(null)}
        titre="Supprimer cette inscription ?"
        description="Les paiements associés seront également supprimés."
        element={
          inscriptionASupprimer
            ? `${inscriptionASupprimer.etudiant?.prenom} ${inscriptionASupprimer.etudiant?.nom} — ${inscriptionASupprimer.formation?.intitule}`
            : null
        }
        onConfirmer={supprimer}
        chargement={suppressionEnCours}
      />

      <FiltresAvances
        ouverte={filtresOuverts}
        onOpenChange={setFiltresOuverts}
        titre="Filtrer les inscriptions"
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
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="validee">Validée</SelectItem>
              <SelectItem value="terminee">Terminée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Formation</Label>
          <Select
            value={String(filtres.formation_id || '')}
            onValueChange={(v) => setFiltres({ ...filtres, formation_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les formations" />
            </SelectTrigger>
            <SelectContent>
              {formations?.data?.map((formation) => (
                <SelectItem key={formation.id} value={String(formation.id)}>
                  {formation.code} — {formation.intitule}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="inscription_de">Du</Label>
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
