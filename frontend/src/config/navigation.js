import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Wallet,
  Tags,
  Settings,
} from 'lucide-react'

export const navigation = [
  { libelle: 'Tableau de bord', chemin: '/', icone: LayoutDashboard },
  { libelle: 'Étudiants', chemin: '/etudiants', icone: Users },
  { libelle: 'Formations', chemin: '/formations', icone: GraduationCap },
  { libelle: 'Inscriptions', chemin: '/inscriptions', icone: ClipboardList },
  { libelle: 'Paiements', chemin: '/paiements', icone: Wallet },
  { libelle: 'Catégories', chemin: '/categories', icone: Tags },
]

export const navigationSecondaire = [{ libelle: 'Paramètres', chemin: '/parametres', icone: Settings }]

/** Renvoie le libellé lisible d'une route. */
export function libelleRoute(chemin) {
  if (chemin === '/') return 'Tableau de bord'
  const segment = chemin.split('/')[1]
  const trouve = [...navigation, ...navigationSecondaire].find((item) => item.chemin === `/${segment}`)
  if (trouve) return trouve.libelle
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}
