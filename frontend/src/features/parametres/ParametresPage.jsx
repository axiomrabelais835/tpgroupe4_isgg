import { useNavigate } from 'react-router-dom'
import { Check, LogOut, Monitor, Moon, Palette, ShieldCheck, Sun, User } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { Logo } from '@/components/brand/Logo'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { initiales } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function ParametresPage() {
  const { utilisateur, deconnexion } = useAuth()
  const { theme, definir } = useTheme()
  const navigate = useNavigate()

  async function seDeconnecter() {
    await deconnexion()
    navigate('/connexion', { replace: true })
  }

  const themes = [
    { valeur: 'light', libelle: 'Clair', icone: Sun },
    { valeur: 'dark', libelle: 'Sombre', icone: Moon },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        titre="Paramètres"
        description="Gérez votre profil, l'apparence de l'application et votre session."
        icone={Palette}
      />

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profil
            </CardTitle>
            <CardDescription>Informations du compte actuellement connecté.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                <AvatarImage src={utilisateur?.photo || undefined} alt="" />
                <AvatarFallback className="text-lg">
                  {initiales(utilisateur?.prenom, utilisateur?.nom)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold">{utilisateur?.nom}</p>
                <p className="text-sm text-muted-foreground">{utilisateur?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {utilisateur?.role}
                  </Badge>
                  <Badge variant="success">Compte actif</Badge>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Nom complet</dt>
                <dd className="mt-0.5 text-sm font-medium">{utilisateur?.nom || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Adresse e-mail</dt>
                <dd className="mt-0.5 truncate text-sm font-medium">{utilisateur?.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rôle</dt>
                <dd className="mt-0.5 text-sm font-medium capitalize">{utilisateur?.role || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Identifiant</dt>
                <dd className="mt-0.5 font-mono text-sm font-medium">#{utilisateur?.id ?? '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Apparence
            </CardTitle>
            <CardDescription>Choisissez le thème qui vous convient. Le réglage est mémorisé.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((option) => {
                const Icone = option.icone
                const actif = theme === option.valeur
                return (
                  <button
                    key={option.valeur}
                    type="button"
                    onClick={() => definir(option.valeur)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                      actif
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                    )}
                    aria-pressed={actif}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        actif ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icone className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{option.libelle}</span>
                      <span className="block text-xs text-muted-foreground">
                        {option.valeur === 'light' ? 'Interface lumineuse' : 'Interface sombre'}
                      </span>
                    </span>
                    {actif && <Check className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Préférences locales</p>
                  <p className="text-xs text-muted-foreground">
                    Le thème et l'état du menu sont enregistrés dans votre navigateur.
                  </p>
                </div>
              </div>
              <Switch defaultChecked disabled aria-label="Préférences locales activées" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Session et sécurité
            </CardTitle>
            <CardDescription>
              Votre session est sécurisée par un jeton Sanctum. Elle expire automatiquement en cas d'inactivité
              prolongée.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">Déconnexion sécurisée</p>
                <p className="text-xs text-muted-foreground">
                  Révoque immédiatement le jeton d'accès sur cet appareil.
                </p>
              </div>
              <Button variant="destructive" onClick={seDeconnecter}>
                <LogOut className="h-4 w-4" /> Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Logo className="h-11 w-auto self-start text-foreground" />
            <CardDescription className="pt-1">
              Groupe Rabelais — gestion des étudiants, formations, inscriptions et paiements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Application métier avec interface React et API Laravel, entièrement en français.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">Laravel 12</Badge>
              <Badge variant="secondary">React 19</Badge>
              <Badge variant="secondary">Tailwind CSS 4</Badge>
              <Badge variant="secondary">Sanctum</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
