import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function FiltresAvances({ ouverte, onOpenChange, titre = 'Filtres avancés', children, onReinitialiser, onAppliquer }) {
  return (
    <Sheet open={ouverte} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{titre}</SheetTitle>
          <SheetDescription>Affinez votre recherche avec des critères précis.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-6 py-4">{children}</div>
        <SheetFooter>
          <Button variant="outline" onClick={onReinitialiser}>
            Réinitialiser
          </Button>
          <Button onClick={onAppliquer}>Appliquer les filtres</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function PuceFiltre({ libelle, onSupprimer }) {
  return (
    <Badge variant="secondary" className="gap-1 py-1 pl-2.5 pr-1.5 text-xs font-medium">
      {libelle}
      <button
        type="button"
        onClick={onSupprimer}
        className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
        aria-label={`Supprimer le filtre ${libelle}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

export function PucesFiltres({ puces = [] }) {
  if (puces.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {puces.map((puce) => (
        <PuceFiltre key={puce.cle} libelle={puce.libelle} onSupprimer={puce.onSupprimer} />
      ))}
    </div>
  )
}
