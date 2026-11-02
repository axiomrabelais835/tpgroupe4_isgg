import { Loader2, TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

/**
 * Boîte de confirmation avec rappel de l'élément concerné.
 */
export function ConfirmDialog({
  ouverte,
  onOpenChange,
  titre = 'Confirmer la suppression',
  description,
  element,
  onConfirmer,
  chargement = false,
  libelleConfirmer = 'Supprimer',
}) {
  return (
    <AlertDialog open={ouverte} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <AlertDialogTitle>{titre}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {element && (
            <div className="mt-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium">
              {element}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={chargement}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirmer()
            }}
            disabled={chargement}
          >
            {chargement && <Loader2 className="h-4 w-4 animate-spin" />}
            {libelleConfirmer}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
