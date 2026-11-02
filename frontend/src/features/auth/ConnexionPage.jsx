import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers/AuthProvider'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("L'adresse e-mail n'est pas valide."),
  mot_de_passe: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

export function ConnexionPage() {
  const { connexion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [voirMotDePasse, setVoirMotDePasse] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', mot_de_passe: '' },
  })

  async function onSubmit(donnees) {
    try {
      await connexion(donnees)
      toast.success('Connexion réussie', { description: 'Bienvenue dans votre espace de gestion.' })
      const destination = location.state?.from?.pathname || '/'
      navigate(destination, { replace: true })
    } catch (erreur) {
      if (erreur.statut === 422 && erreur.erreurs) {
        Object.entries(erreur.erreurs).forEach(([champ, messages]) => {
          if (champ in donnees) setError(champ, { message: messages[0] })
        })
      } else {
        toast.error('Connexion impossible', {
          description: erreur.message || 'Vérifiez vos identifiants et réessayez.',
        })
      }
    }
  }

  return (
    <div className="auth-gradient flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:grid-cols-2"
      >
        {/* Panneau de présentation */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
          <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/60">
              Groupe Rabelais
            </p>
            <div className="mt-3 inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-lg shadow-black/20">
              <Logo className="h-9 w-auto text-[#1E1B4B]" />
            </div>

            <h1 className="mt-12 text-3xl font-extrabold leading-tight">
              Pilotez vos étudiants,
              <br />
              vos formations et vos inscriptions.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
              Une plateforme unique pour suivre les parcours, encaisser les paiements et analyser votre activité en
              temps réel.
            </p>
          </div>

          <div className="relative space-y-3">
            {[
              'Tableau de bord et statistiques en temps réel',
              'Gestion complète des étudiants et formations',
              'Paiements et exports CSV en un clic',
            ].map((avantage) => (
              <div key={avantage} className="flex items-center gap-2.5 text-sm text-primary-foreground/90">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>{avantage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="mb-8 lg:hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Groupe Rabelais</p>
            <Logo className="mt-2 h-10 w-auto text-foreground" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Connexion</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Accédez à votre espace de gestion.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className="pl-9"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mot_de_passe">Mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mot_de_passe"
                  type={voirMotDePasse ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  aria-invalid={Boolean(errors.mot_de_passe)}
                  {...register('mot_de_passe')}
                />
                <button
                  type="button"
                  onClick={() => setVoirMotDePasse((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={voirMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {voirMotDePasse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.mot_de_passe && <p className="text-xs text-destructive">{errors.mot_de_passe.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Besoin d'aide ? Contactez votre administrateur.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
