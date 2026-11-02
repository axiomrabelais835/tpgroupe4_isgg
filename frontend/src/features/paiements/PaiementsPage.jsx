import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, Pencil, Plus, Search, Trash2, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'
import { formationsService, paiementsService, statistiquesService } from '@/services/api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/data-table/DataTable'
import { FiltresAvances, PucesFiltres } from '@/components/data-table/FiltresAvances'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormulairePaiement } from '@/features/paiements/FormulairePaiement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate, formatMontant } from '@/lib/utils'

const FILTRES_VIDES = { mode: '', formation_id: '', paiement_de: '', paiement_a: '' }

export function PaiementsPage() {
  const queryClient = useQueryClient()
  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 350)
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_VIDES)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const [page, setPage] = useState(1)
  const [tri, setTri] = useState({ sort: 'date_paiement', direction: 'desc' })
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [paiementAModifier, setPaiementAModifier] = useState(null)
  const [paiementASupprimer, setPaiementASupprimer] = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [rechercheDebouncee, filtresAppliques, tri.sort, tri.direction])

  const { data, isLoading } = useQuery({
    queryKey: ['paiements', { page, rechercheDebouncee, filtresAppliques, tri }],
    queryFn: () =>
      paiementsService.liste({
        page,
        per_page: 12,
        search: rechercheDebouncee,
        sort: tri.sort,
        direction: tri.direction,
        ...filtresAppliques,
      }),
  })

  const { data: kpis } = useQuery({
    queryKey: ['statistiques', 'kpis-paiements'],
    queryFn: () => statistiquesService.kpis(),
  })

  const { data: formations } = useQuery({
    queryKey: ['formations-options'],
    queryFn: () => formationsService.liste({ per_page: 100, sort: 'intitule', direction: 'asc' }),
  })

  async function supprimer() {
    if (!paiementASupprimer) return
    setSuppressionEnCours(true)
    try {
      await paiementsService.supprimer(paiementASupprimer.id)
      queryClient.invalidateQueries({ queryKey: ['paiements'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success('Paiement supprimé')
      setPaiementASupprimer(null)
    } catch (erreur) {
      toast.error('Suppression impossible', { description: erreur.message })
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const puces = useMemo(() => {
    const liste = []
    if (filtresAppliques.mode) {
      const modes = {
        especes: 'Espèces',
        mobile_money: 'Mobile Money',
        virement: 'Virement',
        carte: 'Carte bancaire',
      }
      liste.push({
        cle: 'mode',
        libelle: `Mode : ${modes[filtresAppliques.mode] ?? filtresAppliques.mode}`,
        onSupprimer: () => majFiltre('mode', ''),
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
    if (filtresAppliques.paiement_de || filtresAppliques.paiement_a) {
      liste.push({
        cle: 'dates',
        libelle: `Du ${filtresAppliques.paiement_de || '…'} au ${filtresAppliques.paiement_a || '…'}`,
        onSupprimer: () => {
          const suivant = { ...filtresAppliques, paiement_de: '', paiement_a: '' }
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
      rendre: (paiement) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {paiement.inscription?.etudiant?.prenom} {paiement.inscription?.etudiant?.nom}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {paiement.inscription?.etudiant?.matricule}
          </p>
        </div>
      ),
    },
    {
      cle: 'formation',
      titre: 'Formation',
      triable: false,
      className: 'hidden lg:table-cell',
      rendre: (paiement) => (
        <span className="block max-w-[220px] truncate text-xs">{paiement.inscription?.formation?.intitule}</span>
      ),
    },
    {
      cle: 'montant',
      titre: 'Montant',
      triable: true,
      rendre: (paiement) => (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatMontant(paiement.montant)}
        </span>
      ),
    },
    {
      cle: 'mode',
      titre: 'Mode',
      triable: false,
      className: 'hidden sm:table-cell',
      rendre: (paiement) => <StatusBadge statut={paiement.mode} />,
    },
    {
      cle: 'reference',
      titre: 'Référence',
      triable: false,
      className: 'hidden xl:table-cell',
      rendre: (paiement) => (
        <span className="font-mono text-[11px] text-muted-foreground">{paiement.reference || '—'}</span>
      ),
    },
    {
      cle: 'date_paiement',
      titre: 'Date',
      triable: true,
      rendre: (paiement) => <span className="text-xs text-muted-foreground">{formatDate(paiement.date_paiement)}</span>,
    },
  ]

  return (
    <div>
      <PageHeader
        titre="Paiements"
        description="Enregistrez et suivez les encaissements de vos inscriptions."
        icone={Wallet}
        actions={
          <Button
            onClick={() => {
              setPaiementAModifier(null)
              setFormulaireOuvert(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nouveau paiement
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <CarteResume
          libelle="Chiffre d'affaires (12 mois)"
          valeur={formatMontant(kpis?.chiffre_affaires?.valeur ?? 0)}
          variation={kpis?.chiffre_affaires?.variation}
        />
        <CarteResume libelle="Paiements enregistrés" valeur={data?.meta?.total ?? 0} />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par étudiant, référence…"
              className="pl-9"
              aria-label="Rechercher un paiement"
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
            icone={Wallet}
            titre="Aucun paiement"
            description="Enregistrez un premier encaissement pour commencer le suivi."
            action={
              <Button onClick={() => setFormulaireOuvert(true)}>
                <Plus className="h-4 w-4" /> Nouveau paiement
              </Button>
            }
          />
        }
        actionsLignes={(paiement) => (
          <>
            <button
              onClick={() => {
                setPaiementAModifier(paiement)
                setFormulaireOuvert(true)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
            <button
              onClick={() => setPaiementASupprimer(paiement)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </>
        )}
      />

      <FormulairePaiement
        ouverte={formulaireOuvert}
        onOpenChange={(ouvert) => {
          setFormulaireOuvert(ouvert)
          if (!ouvert) setPaiementAModifier(null)
        }}
        paiement={paiementAModifier}
      />

      <ConfirmDialog
        ouverte={Boolean(paiementASupprimer)}
        onOpenChange={(ouvert) => !ouvert && setPaiementASupprimer(null)}
        titre="Supprimer ce paiement ?"
        description="Cette action est définitive et réduira le chiffre d'affaires suivi."
        element={
          paiementASupprimer
            ? `${formatMontant(paiementASupprimer.montant)} — ${formatDate(paiementASupprimer.date_paiement)}`
            : null
        }
        onConfirmer={supprimer}
        chargement={suppressionEnCours}
      />

      <FiltresAvances
        ouverte={filtresOuverts}
        onOpenChange={setFiltresOuverts}
        titre="Filtrer les paiements"
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
          <Label>Mode de paiement</Label>
          <Select value={filtres.mode} onValueChange={(v) => setFiltres({ ...filtres, mode: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="especes">Espèces</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="virement">Virement</SelectItem>
              <SelectItem value="carte">Carte bancaire</SelectItem>
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
            <Label htmlFor="paiement_de">Du</Label>
            <Input
              id="paiement_de"
              type="date"
              value={filtres.paiement_de}
              onChange={(e) => setFiltres({ ...filtres, paiement_de: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paiement_a">Au</Label>
            <Input
              id="paiement_a"
              type="date"
              value={filtres.paiement_a}
              onChange={(e) => setFiltres({ ...filtres, paiement_a: e.target.value })}
            />
          </div>
        </div>
      </FiltresAvances>
    </div>
  )
}

function CarteResume({ libelle, valeur, variation }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Wallet className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{libelle}</p>
        <p className="truncate text-lg font-bold leading-tight">{valeur}</p>
      </div>
      {typeof variation === 'number' && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            variation >= 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {variation >= 0 ? '+' : ''}
          {variation.toFixed(1)} %
        </span>
      )}
    </div>
  )
}
