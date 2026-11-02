import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

const ConnexionPage = lazy(() =>
  import('@/features/auth/ConnexionPage').then((m) => ({ default: m.ConnexionPage }))
)
const TableauDeBordPage = lazy(() =>
  import('@/features/dashboard/TableauDeBordPage').then((m) => ({ default: m.TableauDeBordPage }))
)
const EtudiantsPage = lazy(() =>
  import('@/features/etudiants/EtudiantsPage').then((m) => ({ default: m.EtudiantsPage }))
)
const FormationsPage = lazy(() =>
  import('@/features/formations/FormationsPage').then((m) => ({ default: m.FormationsPage }))
)
const InscriptionsPage = lazy(() =>
  import('@/features/inscriptions/InscriptionsPage').then((m) => ({ default: m.InscriptionsPage }))
)
const PaiementsPage = lazy(() =>
  import('@/features/paiements/PaiementsPage').then((m) => ({ default: m.PaiementsPage }))
)
const CategoriesPage = lazy(() =>
  import('@/features/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
)
const ParametresPage = lazy(() =>
  import('@/features/parametres/ParametresPage').then((m) => ({ default: m.ParametresPage }))
)
const NonTrouvePage = lazy(() =>
  import('@/features/erreurs/NonTrouvePage').then((m) => ({ default: m.NonTrouvePage }))
)

function ChargementPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm">Chargement…</p>
      </div>
    </div>
  )
}

function avecSuspense(Composant) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Composant />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: '/connexion', element: avecSuspense(ConnexionPage) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: avecSuspense(TableauDeBordPage) },
          { path: 'etudiants', element: avecSuspense(EtudiantsPage) },
          { path: 'formations', element: avecSuspense(FormationsPage) },
          { path: 'inscriptions', element: avecSuspense(InscriptionsPage) },
          { path: 'paiements', element: avecSuspense(PaiementsPage) },
          { path: 'categories', element: avecSuspense(CategoriesPage) },
          { path: 'parametres', element: avecSuspense(ParametresPage) },
          { path: '404', element: avecSuspense(NonTrouvePage) },
          { path: '*', element: <Navigate to="/404" replace /> },
        ],
      },
    ],
  },
])
