import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Mail, MapPin, Pencil, Phone, Wallet } from 'lucide-react'
import { etudiantsService } from '@/services/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatMontant, initiales } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function FicheEtudiant({ ouverte, onOpenChange, etudiantId, onModifier }) {
  const { data: etudiant, isLoading } = useQuery({
    queryKey: ['etudiant', etudiantId],
    queryFn: () => etudiantsService.detail(etudiantId),
    enabled: Boolean(etudiantId) && ouverte,
  })

  const inscriptions = etudiant?.inscriptions ?? []
  const paiements = inscriptions.flatMap((i) => (i.paiements ?? []).map((p) => ({ ...p, formation: i.formation })))
  const totalPaye = paiements.reduce((somme, p) => somme + Number(p.montant || 0), 0)

  return (
    <Sheet open={ouverte} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading && (
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {etudiant && (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                  <AvatarImage src={etudiant.photo || undefined} alt="" />
                  <AvatarFallback className="text-lg">{initiales(etudiant.prenom, etudiant.nom)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="truncate text-xl">
                    {etudiant.prenom} {etudiant.nom}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 font-mono text-xs">{etudiant.matricule}</SheetDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge statut={etudiant.statut} />
                    <Badge variant="outline">{etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onModifier(etudiant)}>
                  <Pencil className="h-4 w-4" /> Modifier
                </Button>
              </div>
            </SheetHeader>

            <Tabs defaultValue="profil" className="px-6">
              <TabsList className="w-full">
                <TabsTrigger value="profil" className="flex-1">
                  Profil
                </TabsTrigger>
                <TabsTrigger value="inscriptions" className="flex-1">
                  Inscriptions
                </TabsTrigger>
                <TabsTrigger value="paiements" className="flex-1">
                  Paiements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profil" className="space-y-4">
                <div className="grid gap-3 rounded-xl border border-border p-4 text-sm">
                  <InfoLigne icone={Mail} libelle="E-mail" valeur={etudiant.email} />
                  <InfoLigne icone={Phone} libelle="Téléphone" valeur={etudiant.telephone} />
                  <InfoLigne
                    icone={MapPin}
                    libelle="Adresse"
                    valeur={[etudiant.adresse, etudiant.ville, etudiant.pays].filter(Boolean).join(', ')}
                  />
                  <InfoLigne icone={CalendarDays} libelle="Date de naissance" valeur={formatDate(etudiant.date_naissance)} />
                  <InfoLigne icone={CalendarDays} libelle="Inscrit le" valeur={formatDate(etudiant.date_inscription)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Statistique libelle="Formations" valeur={inscriptions.length} />
                  <Statistique libelle="Total payé" valeur={formatMontant(totalPaye)} />
                </div>
              </TabsContent>

              <TabsContent value="inscriptions">
                {inscriptions.length === 0 ? (
                  <EmptyState
                    titre="Aucune inscription"
                    description="Cet étudiant n'est inscrit à aucune formation pour le moment."
                  />
                ) : (
                  <div className="space-y-2">
                    {inscriptions.map((inscription) => (
                      <div key={inscription.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{inscription.formation?.intitule}</p>
                          <StatusBadge statut={inscription.statut} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">{inscription.formation?.code}</span>
                          <span>Inscrit le {formatDate(inscription.date_inscription)}</span>
                          {inscription.note_finale !== null && <span>Note : {inscription.note_finale}/20</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paiements">
                {paiements.length === 0 ? (
                  <EmptyState
                    icone={Wallet}
                    titre="Aucun paiement"
                    description="Aucun paiement n'a été enregistré pour cet étudiant."
                  />
                ) : (
                  <div className="rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Formation</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paiements.map((paiement) => (
                          <TableRow key={paiement.id}>
                            <TableCell className="max-w-[180px] truncate text-xs">{paiement.formation?.intitule}</TableCell>
                            <TableCell className="text-xs">{formatDate(paiement.date_paiement)}</TableCell>
                            <TableCell className="text-right text-xs font-medium">{formatMontant(paiement.montant)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoLigne({ icone: Icone, libelle, valeur }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{libelle}</p>
        <p className="truncate font-medium">{valeur || '—'}</p>
      </div>
    </div>
  )
}

function Statistique({ libelle, valeur }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{libelle}</p>
      <p className="mt-1 text-lg font-bold">{valeur}</p>
    </div>
  )
}
