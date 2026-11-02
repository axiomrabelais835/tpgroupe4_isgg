import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Loader2 } from 'lucide-react'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { etudiantsService, formationsService } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { initiales } from '@/lib/utils'

export function GlobalSearch({ ouverte, onOpenChange }) {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 300)

  useEffect(() => {
    if (!ouverte) setRecherche('')
  }, [ouverte])

  const { data: etudiants, isFetching: chargeEtudiants } = useQuery({
    queryKey: ['recherche-globale-etudiants', rechercheDebouncee],
    queryFn: () => etudiantsService.liste({ search: rechercheDebouncee, per_page: 5 }),
    enabled: ouverte && rechercheDebouncee.length >= 2,
  })

  const { data: formations, isFetching: chargeFormations } = useQuery({
    queryKey: ['recherche-globale-formations', rechercheDebouncee],
    queryFn: () => formationsService.liste({ search: rechercheDebouncee, per_page: 5 }),
    enabled: ouverte && rechercheDebouncee.length >= 2,
  })

  function aller(chemin) {
    onOpenChange(false)
    navigate(chemin)
  }

  const chargement = chargeEtudiants || chargeFormations

  return (
    <CommandDialog open={ouverte} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Rechercher un étudiant, une formation..."
        value={recherche}
        onValueChange={setRecherche}
      />
      <CommandList>
        {chargement && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Recherche en cours…
          </div>
        )}

        {!chargement && rechercheDebouncee.length < 2 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Saisissez au moins 2 caractères.</p>
        )}

        {!chargement && rechercheDebouncee.length >= 2 && (
          <>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

            {etudiants?.data?.length > 0 && (
              <CommandGroup heading="Étudiants">
                {etudiants.data.map((etudiant) => (
                  <CommandItem
                    key={`etu-${etudiant.id}`}
                    value={`${etudiant.prenom} ${etudiant.nom} ${etudiant.matricule}`}
                    onSelect={() => aller(`/etudiants?fiche=${etudiant.id}`)}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {initiales(etudiant.prenom, etudiant.nom)}
                    </span>
                    <span className="flex-1 truncate">
                      {etudiant.prenom} {etudiant.nom}
                    </span>
                    <span className="text-xs text-muted-foreground">{etudiant.matricule}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {formations?.data?.length > 0 && (
              <CommandGroup heading="Formations">
                {formations.data.map((formation) => (
                  <CommandItem
                    key={`form-${formation.id}`}
                    value={`${formation.intitule} ${formation.code}`}
                    onSelect={() => aller(`/formations?fiche=${formation.id}`)}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <GraduationCap className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 truncate">{formation.intitule}</span>
                    <span className="text-xs text-muted-foreground">{formation.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
