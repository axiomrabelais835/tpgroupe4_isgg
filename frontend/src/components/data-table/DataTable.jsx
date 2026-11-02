import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * Tableau de données générique : tri serveur, sélection multiple,
 * visibilité des colonnes, pagination serveur.
 */
export function DataTable({
  colonnes,
  donnees = [],
  chargement = false,
  tri = { sort: null, direction: 'asc' },
  onTriChange,
  pagination,
  onPageChange,
  selection = [],
  onSelectionChange,
  actionsLignes,
  vide,
  actionsGroupees,
  cleLigne = 'id',
}) {
  const [colonnesVisibles, setColonnesVisibles] = useState(() => colonnes.map((c) => c.cle))

  const colonnesAffichees = colonnes.filter((c) => colonnesVisibles.includes(c.cle))
  const idsPage = donnees.map((d) => d[cleLigne])
  const tousSelectionnes = idsPage.length > 0 && idsPage.every((id) => selection.includes(id))
  const certainsSelectionnes = idsPage.some((id) => selection.includes(id)) && !tousSelectionnes

  function basculerTout(actif) {
    if (!onSelectionChange) return
    if (actif) onSelectionChange([...new Set([...selection, ...idsPage])])
    else onSelectionChange(selection.filter((id) => !idsPage.includes(id)))
  }

  function basculerLigne(id, actif) {
    if (!onSelectionChange) return
    onSelectionChange(actif ? [...selection, id] : selection.filter((s) => s !== id))
  }

  function trier(colonne) {
    if (!colonne.triable || !onTriChange) return
    const direction = tri.sort === colonne.cle && tri.direction === 'asc' ? 'desc' : 'asc'
    onTriChange(colonne.cle, direction)
  }

  function IconeTri({ colonne }) {
    if (!colonne.triable) return null
    if (tri.sort !== colonne.cle) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    return tri.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {selection.length > 0 ? (
            <span className="font-medium text-foreground">{selection.length} sélectionné(s)</span>
          ) : chargement ? (
            <span>Chargement…</span>
          ) : (
            <span>{pagination ? `${pagination.total ?? 0} élément(s)` : `${donnees.length} élément(s)`}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selection.length > 0 && actionsGroupees}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns3 className="h-4 w-4" />
                <span className="hidden sm:inline">Colonnes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {colonnes.map((colonne) => (
                <DropdownMenuCheckboxItem
                  key={colonne.cle}
                  checked={colonnesVisibles.includes(colonne.cle)}
                  onCheckedChange={(actif) =>
                    setColonnesVisibles((valeurs) =>
                      actif ? [...valeurs, colonne.cle] : valeurs.filter((v) => v !== colonne.cle)
                    )
                  }
                  disabled={colonnesVisibles.length === 1 && colonnesVisibles.includes(colonne.cle)}
                >
                  {colonne.titre}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {onSelectionChange && (
              <TableHead className="w-10">
                <Checkbox
                  checked={tousSelectionnes || (certainsSelectionnes && 'indeterminate')}
                  onCheckedChange={basculerTout}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
            )}
            {colonnesAffichees.map((colonne) => (
              <TableHead key={colonne.cle} className={cn(colonne.className)}>
                <button
                  type="button"
                  onClick={() => trier(colonne)}
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    colonne.triable && 'transition-colors hover:text-foreground'
                  )}
                  disabled={!colonne.triable}
                >
                  {colonne.titre}
                  <IconeTri colonne={colonne} />
                </button>
              </TableHead>
            ))}
            {actionsLignes && <TableHead className="w-12 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {chargement &&
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {onSelectionChange && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {colonnesAffichees.map((colonne) => (
                  <TableCell key={colonne.cle}>
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </TableCell>
                ))}
                {actionsLignes && (
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))}

          {!chargement &&
            donnees.map((ligne) => (
              <TableRow key={ligne[cleLigne]} data-state={selection.includes(ligne[cleLigne]) ? 'selected' : undefined}>
                {onSelectionChange && (
                  <TableCell>
                    <Checkbox
                      checked={selection.includes(ligne[cleLigne])}
                      onCheckedChange={(actif) => basculerLigne(ligne[cleLigne], actif)}
                      aria-label="Sélectionner la ligne"
                    />
                  </TableCell>
                )}
                {colonnesAffichees.map((colonne) => (
                  <TableCell key={colonne.cle} className={cn(colonne.className)}>
                    {colonne.rendre ? colonne.rendre(ligne) : (ligne[colonne.cle] ?? '—')}
                  </TableCell>
                ))}
                {actionsLignes && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Actions de la ligne">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">{actionsLignes(ligne)}</DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {!chargement && donnees.length === 0 && (vide ?? <EmptyState />)}

      {pagination && pagination.last_page > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {pagination.from ?? 0}–{pagination.to ?? 0} sur {pagination.total ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Précédent
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              Page {pagination.current_page} / {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ActionItem({ icone: Icone, children, ...props }) {
  return (
    <button
      className="relative flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted"
      {...props}
    >
      {Icone && <Icone className="h-4 w-4" />}
      {children}
    </button>
  )
}
