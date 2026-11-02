import { Badge } from '@/components/ui/badge'

const CONFIG = {
  // Étudiants
  actif: { libelle: 'Actif', variant: 'success' },
  suspendu: { libelle: 'Suspendu', variant: 'warning' },
  diplome: { libelle: 'Diplômé', variant: 'info' },
  abandon: { libelle: 'Abandon', variant: 'danger' },
  // Formations
  planifiee: { libelle: 'Planifiée', variant: 'info' },
  en_cours: { libelle: 'En cours', variant: 'success' },
  terminee: { libelle: 'Terminée', variant: 'secondary' },
  annulee: { libelle: 'Annulée', variant: 'danger' },
  // Inscriptions
  en_attente: { libelle: 'En attente', variant: 'warning' },
  validee: { libelle: 'Validée', variant: 'success' },
  // Niveaux
  debutant: { libelle: 'Débutant', variant: 'info' },
  intermediaire: { libelle: 'Intermédiaire', variant: 'warning' },
  avance: { libelle: 'Avancé', variant: 'purple' },
  // Paiements
  especes: { libelle: 'Espèces', variant: 'secondary' },
  mobile_money: { libelle: 'Mobile Money', variant: 'info' },
  virement: { libelle: 'Virement', variant: 'purple' },
  carte: { libelle: 'Carte', variant: 'success' },
}

export function StatusBadge({ statut, className }) {
  const config = CONFIG[statut] ?? { libelle: statut ?? '—', variant: 'secondary' }
  return (
    <Badge variant={config.variant} className={className}>
      {config.libelle}
    </Badge>
  )
}

export function libelleStatut(statut) {
  return CONFIG[statut]?.libelle ?? statut
}
