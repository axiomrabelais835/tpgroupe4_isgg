import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, Layers, Pencil, Users, Wallet } from 'lucide-react'
import { formationsService } from '@/services/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatMontant, initiales } from '@/lib/utils'

export function FicheFormation({ ouverte, onOpenChange, formationId, onModifier }) {
  const { data: formation, isLoading } = useQuery({
    queryKey: ['formation', formationId],
    queryFn: () => formationsService.detail(formationId),
    enabled: Boolean(formationId) && ouverte,
  })

  const inscrits = formation?.inscriptions ?? []
  const capacite = formation?.capacite_max ?? 0
  const remplissage = capacite > 0 ? Math.min(100, Math.round((inscrits.length / capacite) * 100)) : 0
  const notes = inscrits.filter((i) => i.note_finale !== null).map((i) => Number(i.note_finale))
  const moyenne = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2) : '—'
  const revenus = inscrits.reduce((somme, i) => somme + Number(i.montant_total_paye ?? 0), 0)

  return (
    <Sheet open={ouverte} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading && (
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {formation && (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">{formation.intitule}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs">{formation.code}</span>
                  <StatusBadge statut={formation.statut} />
                  <StatusBadge statut={formation.niveau} />
                </div>
              </SheetDescription>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onModifier(formation)}>
                  <Pencil className="h-4 w-4" /> Modifier
                </Button>
                <Badge variant="outline">{formation.categorie?.nom}</Badge>
              </div>
            </SheetHeader>

            <div className="space-y-5 px-6 pb-6">
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Taux de remplissage</span>
                  <span className="font-semibold">
                    {inscrits.length}/{capacite} ({remplissage} %)
                  </span>
                </div>
                <Progress
                  value={remplissage}
                  indicateurClassName={
                    remplissage >= 90 ? 'bg-red-500' : remplissage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }
                />
              </div>

              <div className="grid gap-3 rounded-xl border border-border p-4 text-sm">
                <Ligne icone={Clock} libelle="Durée" valeur={`${formation.duree_heures} heures`} />
                <Ligne icone={Wallet} libelle="Prix" valeur={formatMontant(formation.prix)} />
                <Ligne icone={CalendarDays} libelle="Début" valeur={formatDate(formation.date_debut)} />
                <Ligne icone={CalendarDays} libelle="Fin" valeur={formation.date_fin ? formatDate(formation.date_fin) : '—'} />
                <Ligne icone={Layers} libelle="Catégorie" valeur={formation.categorie?.nom} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Statistique libelle="Inscrits" valeur={inscrits.length} />
                <Statistique libelle="Moyenne" valeur={moyenne === '—' ? '—' : `${moyenne}/20`} />
                <Statistique libelle="Revenus" valeur={formatMontant(revenus)} />
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4" /> Étudiants inscrits
                </h3>
                {inscrits.length === 0 ? (
                  <EmptyState
                    icone={Users}
                    titre="Aucun inscrit"
                    description="Cette formation n'accueille encore aucun étudiant."
                  />
                ) : (
                  <div className="space-y-2">
                    {inscrits.map((inscription) => (
                      <div key={inscription.id} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={inscription.etudiant?.photo || undefined} alt="" />
                          <AvatarFallback className="text-[10px]">
                            {initiales(inscription.etudiant?.prenom, inscription.etudiant?.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">{inscription.etudiant?.matricule}</p>
                        </div>
                        <StatusBadge statut={inscription.statut} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Ligne({ icone: Icone, libelle, valeur }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icone className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{libelle}</span>
      <span className="ml-auto font-medium">{valeur || '—'}</span>
    </div>
  )
}

function Statistique({ libelle, valeur }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-xs text-muted-foreground">{libelle}</p>
      <p className="mt-1 text-sm font-bold">{valeur}</p>
    </div>
  )
}
