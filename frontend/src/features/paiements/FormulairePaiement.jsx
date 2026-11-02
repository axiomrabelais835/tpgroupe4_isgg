import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { paiementSchema } from '@/lib/schemas'
import { inscriptionsService, paiementsService } from '@/services/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { cn, formatMontant } from '@/lib/utils'

function libelleInscription(inscription) {
  if (!inscription) return ''
  return `${inscription.etudiant?.prenom ?? ''} ${inscription.etudiant?.nom ?? ''} — ${inscription.formation?.code ?? ''}`
}

export function FormulairePaiement({ ouverte, onOpenChange, paiement = null }) {
  const queryClient = useQueryClient()
  const modeEdition = Boolean(paiement)
  const [comboboxOuvert, setComboboxOuvert] = useState(false)
  const [recherche, setRecherche] = useState('')
  const rechercheDebouncee = useDebounce(recherche, 300)
  const [libelleSelectionne, setLibelleSelectionne] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      inscription_id: '',
      montant: '',
      mode: 'especes',
      reference: '',
      date_paiement: new Date().toISOString().slice(0, 10),
    },
  })

  const { data: options, isFetching } = useQuery({
    queryKey: ['inscriptions-options-paiement', rechercheDebouncee],
    queryFn: () =>
      inscriptionsService.liste({
        search: rechercheDebouncee,
        per_page: 20,
        sort: 'date_inscription',
        direction: 'desc',
      }),
    enabled: ouverte && comboboxOuvert,
  })

  useEffect(() => {
    if (!ouverte) return
    reset({
      inscription_id: paiement ? String(paiement.inscription_id ?? '') : '',
      montant: paiement ? Number(paiement.montant ?? 0) : '',
      mode: paiement?.mode ?? 'especes',
      reference: paiement?.reference ?? '',
      date_paiement: paiement?.date_paiement ?? new Date().toISOString().slice(0, 10),
    })
    setLibelleSelectionne(libelleInscription(paiement?.inscription))
    setRecherche('')
  }, [ouverte, paiement, reset])

  const mutation = useMutation({
    mutationFn: (donnees) => {
      const charge = { ...donnees, montant: Number(donnees.montant), reference: donnees.reference || null }
      return modeEdition ? paiementsService.modifier(paiement.id, charge) : paiementsService.creer(charge)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paiements'] })
      queryClient.invalidateQueries({ queryKey: ['statistiques'] })
      toast.success(modeEdition ? 'Paiement mis à jour' : 'Paiement enregistré')
      onOpenChange(false)
    },
    onError: (erreur) => {
      if (erreur.statut === 422 && erreur.erreurs) {
        Object.entries(erreur.erreurs).forEach(([champ, messages]) => {
          setError(champ, { message: messages[0] })
        })
        toast.error('Paiement invalide', { description: 'Vérifiez les informations saisies.' })
      } else {
        toast.error('Enregistrement impossible', { description: erreur.message })
      }
    },
  })

  const inscriptionId = watch('inscription_id')
  const mode = watch('mode')

  const inscriptionSelectionnee = useMemo(
    () => options?.data?.find((i) => String(i.id) === String(inscriptionId)),
    [options, inscriptionId]
  )

  return (
    <Dialog open={ouverte} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{modeEdition ? 'Modifier le paiement' : 'Nouveau paiement'}</DialogTitle>
          <DialogDescription>
            Enregistrez un encaissement lié à une inscription existante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label>Inscription *</Label>
            <Popover open={comboboxOuvert} onOpenChange={setComboboxOuvert} modal>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={comboboxOuvert}
                  aria-invalid={Boolean(errors.inscription_id)}
                  className={cn(
                    'flex h-9 w-full items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring',
                    !libelleSelectionne && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate">{libelleSelectionne || 'Rechercher une inscription…'}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Étudiant, matricule, formation…"
                    value={recherche}
                    onValueChange={setRecherche}
                  />
                  <CommandList>
                    {isFetching && (
                      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Recherche…
                      </div>
                    )}
                    {!isFetching && (
                      <>
                        <CommandEmpty>Aucune inscription trouvée.</CommandEmpty>
                        <CommandGroup>
                          {options?.data?.map((inscription) => (
                            <CommandItem
                              key={inscription.id}
                              value={String(inscription.id)}
                              onSelect={() => {
                                setValue('inscription_id', String(inscription.id), { shouldValidate: true })
                                setLibelleSelectionne(libelleInscription(inscription))
                                setComboboxOuvert(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  String(inscription.id) === String(inscriptionId) ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {inscription.etudiant?.prenom} {inscription.etudiant?.nom}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  {inscription.formation?.code}
                                </span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.inscription_id && <p className="text-xs text-destructive">{errors.inscription_id.message}</p>}
            {inscriptionSelectionnee && (
              <p className="text-xs text-muted-foreground">
                Formation : {inscriptionSelectionnee.formation?.intitule} · Prix :{' '}
                {formatMontant(inscriptionSelectionnee.formation?.prix)}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="montant">Montant (FCFA) *</Label>
              <Input
                id="montant"
                type="number"
                min={0.01}
                step="0.01"
                placeholder="0"
                {...register('montant')}
                aria-invalid={Boolean(errors.montant)}
              />
              {errors.montant && <p className="text-xs text-destructive">{errors.montant.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Mode de paiement *</Label>
              <Select value={mode} onValueChange={(v) => setValue('mode', v, { shouldValidate: true })}>
                <SelectTrigger aria-invalid={Boolean(errors.mode)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="carte">Carte bancaire</SelectItem>
                </SelectContent>
              </Select>
              {errors.mode && <p className="text-xs text-destructive">{errors.mode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_paiement">Date du paiement *</Label>
              <Input id="date_paiement" type="date" {...register('date_paiement')} />
              {errors.date_paiement && <p className="text-xs text-destructive">{errors.date_paiement.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference">Référence</Label>
              <Input id="reference" placeholder="Ex : MM-2026-0042" {...register('reference')} />
              {errors.reference && <p className="text-xs text-destructive">{errors.reference.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {modeEdition ? 'Enregistrer' : 'Enregistrer le paiement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
