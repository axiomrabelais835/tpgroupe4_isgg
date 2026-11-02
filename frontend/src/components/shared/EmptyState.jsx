import { Inbox } from 'lucide-react'

export function EmptyState({
  icone: Icone = Inbox,
  titre = 'Aucun résultat',
  description = "Aucun élément ne correspond à votre recherche.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-semibold">{titre}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
