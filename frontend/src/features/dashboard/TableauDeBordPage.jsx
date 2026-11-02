import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { statistiquesService } from '@/services/api'
import { useAuth } from '@/app/providers/AuthProvider'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatMontant, initiales } from '@/lib/utils'

const COULEURS_STATUTS = {
  actif: '#10b981',
  suspendu: '#f59e0b',
  diplome: '#0ea5e9',
  abandon: '#ef4444',
}

const PERIODES = {
  '3': { libelle: '3 derniers mois', mois: 3 },
  '6': { libelle: '6 derniers mois', mois: 6 },
  '12': { libelle: '12 derniers mois', mois: 12 },
  '30j': { libelle: '30 derniers jours', jours: 30 },
}

function bornesPeriode(valeur) {
  const a = new Date()
  const de = new Date()
  const config = PERIODES[valeur]

  if (config.jours) {
    de.setDate(de.getDate() - (config.jours - 1))
  } else {
    de.setMonth(de.getMonth() - (config.mois - 1), 1)
    de.setHours(0, 0, 0, 0)
  }

  return { de: de.toISOString().slice(0, 10), a: a.toISOString().slice(0, 10) }
}

function formatMois(cle) {
  if (!cle) return ''
  const [annee, mois] = cle.split('-')
  const date = new Date(Number(annee), Number(mois) - 1, 1)
  return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(date)
}

const styleInfobulle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 12,
  color: 'var(--color-foreground)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}

export function TableauDeBordPage() {
  const { utilisateur } = useAuth()
  const queryClient = useQueryClient()
  const [periode, setPeriode] = useState('12')
  const bornes = useMemo(() => bornesPeriode(periode), [periode])
  const mois = PERIODES[periode].mois ?? 12

  const { data, isLoading } = useQuery({
    queryKey: ['statistiques', 'tableau-de-bord', bornes, mois],
    queryFn: () => statistiquesService.tableauDeBord({ ...bornes, mois }),
  })

  const kpis = data?.kpis
  const evolution = data?.evolution_inscriptions
  const statuts = data?.repartition_statuts
  const revenus = data?.revenus_mensuels
  const topFormations = data?.top_formations
  const bientotCompletes = data?.formations_bientot_completes
  const dernieresInscriptions = data?.dernieres_inscriptions
  const paiementsRecents = data?.paiements_recents

  const totalStatuts = (statuts ?? []).reduce((somme, item) => somme + Number(item.valeur ?? 0), 0)
  const prenom = utilisateur?.nom?.split(' ')[0] ?? ''

  function rafraichir() {
    queryClient.invalidateQueries({ queryKey: ['statistiques'] })
  }

  return (
    <div>
      <PageHeader
        titre={`Bonjour${prenom ? `, ${prenom}` : ''} 👋`}
        description="Voici la synthèse de l'activité de votre centre de formation."
        actions={
          <>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[190px]">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIODES).map(([cle, config]) => (
                  <SelectItem key={cle} value={cle}>
                    {config.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={rafraichir} aria-label="Actualiser les statistiques">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      {/* KPI */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-[116px] rounded-xl" />)
          : (
            <>
              <CarteKpi
                icone={Users}
                libelle="Étudiants"
                valeur={kpis?.total_etudiants?.valeur ?? 0}
                detail={`${kpis?.etudiants_actifs?.valeur ?? 0} actifs`}
                couleur="primary"
              />
              <CarteKpi
                icone={ClipboardList}
                libelle="Inscriptions sur la période"
                valeur={kpis?.inscriptions_periode?.valeur ?? 0}
                variation={kpis?.inscriptions_periode?.variation}
                detail={`${kpis?.inscriptions_periode?.precedent ?? 0} période précédente`}
                couleur="accent"
              />
              <CarteKpi
                icone={Wallet}
                libelle="Chiffre d'affaires"
                valeur={formatMontant(kpis?.chiffre_affaires?.valeur ?? 0)}
                variation={kpis?.chiffre_affaires?.variation}
                detail={`${formatMontant(kpis?.chiffre_affaires?.precedent ?? 0)} précédemment`}
                couleur="emerald"
              />
              <CarteKpi
                icone={GraduationCap}
                libelle="Formations en cours"
                valeur={kpis?.formations_en_cours?.valeur ?? 0}
                detail={`${kpis?.taux_remplissage_moyen?.valeur ?? 0} % de remplissage`}
                couleur="violet"
              />
            </>
          )}
      </div>

      {/* Évolution + statuts */}
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Évolution des inscriptions
              </CardTitle>
              <CardDescription>Nombre d'inscriptions enregistrées par mois.</CardDescription>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {PERIODES[periode].libelle}
            </span>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={evolution ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="degradeInscriptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="mois"
                    tickFormatter={formatMois}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={styleInfobulle}
                    labelFormatter={(valeur) => formatMois(valeur)}
                    formatter={(valeur) => [`${valeur} inscription(s)`, 'Total']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#degradeInscriptions)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Statuts des étudiants
            </CardTitle>
            <CardDescription>Répartition de votre base étudiante.</CardDescription>
          </CardHeader>
          <CardContent>
            {!statuts?.length ? (
              <EmptyState titre="Aucune donnée" description="Aucun étudiant enregistré pour le moment." />
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie
                        data={statuts}
                        dataKey="valeur"
                        nameKey="nom"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {statuts.map((entree) => (
                          <Cell key={entree.cle} fill={COULEURS_STATUTS[entree.cle] ?? '#6366f1'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={styleInfobulle}
                        formatter={(valeur, nom) => [`${valeur} étudiant(s)`, nom]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold">{totalStatuts}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">étudiants</span>
                  </div>
                </div>

                <ul className="mt-3 space-y-2">
                  {statuts.map((entree) => (
                    <li key={entree.cle} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COULEURS_STATUTS[entree.cle] ?? '#6366f1' }}
                      />
                      <span className="flex-1 text-muted-foreground">{entree.nom}</span>
                      <span className="font-semibold">{entree.valeur}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenus + jauges */}
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500" /> Revenus mensuels
            </CardTitle>
            <CardDescription>Montants encaissés sur la période sélectionnée.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenus ?? []} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="mois"
                  tickFormatter={formatMois}
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(valeur) =>
                    new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(valeur)
                  }
                />
                <Tooltip
                  contentStyle={styleInfobulle}
                  labelFormatter={(valeur) => formatMois(valeur)}
                  formatter={(valeur) => [formatMontant(valeur), 'Encaissé']}
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" /> Indicateurs clés
            </CardTitle>
            <CardDescription>Performance globale du centre.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Jauge
                valeur={Number(kpis?.taux_remplissage_moyen?.valeur ?? 0)}
                libelle="Remplissage"
                couleur="var(--color-primary)"
              />
              <Jauge
                valeur={Number(kpis?.taux_reussite?.valeur ?? 0)}
                libelle="Réussite"
                couleur="#10b981"
              />
            </div>

            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Étudiants actifs</span>
                  <span className="font-semibold">
                    {kpis?.etudiants_actifs?.valeur ?? 0}/{kpis?.total_etudiants?.valeur ?? 0}
                  </span>
                </div>
                <Progress
                  value={
                    kpis?.total_etudiants?.valeur
                      ? (Number(kpis.etudiants_actifs.valeur) / Number(kpis.total_etudiants.valeur)) * 100
                      : 0
                  }
                  indicateurClassName="bg-emerald-500"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Formations en cours</span>
                  <span className="font-semibold">{kpis?.formations_en_cours?.valeur ?? 0}</span>
                </div>
                <Progress value={Math.min(100, Number(kpis?.formations_en_cours?.valeur ?? 0) * 10)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top formations + bientôt complètes */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Formations les plus demandées
            </CardTitle>
            <CardDescription>Top 5 par nombre d'inscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            {!topFormations?.length ? (
              <EmptyState titre="Aucune formation" description="Créez des formations pour voir ce classement." />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topFormations}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={12}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="code"
                    width={72}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={styleInfobulle}
                    formatter={(valeur) => [`${valeur} inscription(s)`, 'Total']}
                    labelFormatter={(code) => {
                      const formation = topFormations.find((f) => f.code === code)
                      return formation?.intitule ?? code
                    }}
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                  />
                  <Bar dataKey="total" fill="var(--color-accent)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" /> Formations bientôt complètes
            </CardTitle>
            <CardDescription>Capacité de remplissage supérieure à 70 %.</CardDescription>
          </CardHeader>
          <CardContent>
            {!bientotCompletes?.length ? (
              <EmptyState
                icone={GraduationCap}
                titre="Aucune alerte"
                description="Aucune formation n'approche de sa capacité maximale."
              />
            ) : (
              <div className="space-y-4">
                {bientotCompletes.slice(0, 5).map((formation) => (
                  <div key={formation.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <Link
                        to={`/formations?fiche=${formation.id}`}
                        className="truncate font-medium transition-colors hover:text-primary hover:underline"
                      >
                        {formation.intitule}
                      </Link>
                      <span className="shrink-0 text-muted-foreground">
                        {formation.inscrits}/{formation.capacite_max} · {Math.round(formation.pourcentage)} %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, formation.pourcentage)}
                      className="h-1.5"
                      indicateurClassName={
                        formation.pourcentage >= 90
                          ? 'bg-red-500'
                          : formation.pourcentage >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listes récentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> Dernières inscriptions
              </CardTitle>
              <CardDescription>Les 6 plus récentes.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inscriptions">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!dernieresInscriptions?.length ? (
              <EmptyState titre="Aucune inscription" description="Les nouvelles inscriptions apparaîtront ici." />
            ) : (
              <ul className="divide-y divide-border">
                {dernieresInscriptions.map((inscription) => (
                  <li key={inscription.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[10px]">
                        {initiales(
                          inscription.etudiant?.split(' ')[0],
                          inscription.etudiant?.split(' ')[1]
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{inscription.etudiant ?? '—'}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{inscription.formation}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge statut={inscription.statut} />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(inscription.date_inscription)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" /> Paiements récents
              </CardTitle>
              <CardDescription>Les 6 derniers encaissements.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/paiements">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!paiementsRecents?.length ? (
              <EmptyState
                icone={Wallet}
                titre="Aucun paiement"
                description="Les encaissements récents apparaîtront ici."
              />
            ) : (
              <ul className="divide-y divide-border">
                {paiementsRecents.map((paiement) => (
                  <li key={paiement.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{paiement.etudiant ?? '—'}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{paiement.formation}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatMontant(paiement.montant)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(paiement.date_paiement)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const COULEURS_KPI = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
}

function CarteKpi({ icone: Icone, libelle, valeur, detail, variation, couleur = 'primary' }) {
  const positif = (variation ?? 0) >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${COULEURS_KPI[couleur]}`}>
          <Icone className="h-5 w-5" />
        </div>
        {typeof variation === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              positif
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {positif ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(variation).toFixed(1)} %
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{libelle}</p>
      <p className="mt-0.5 truncate text-2xl font-extrabold tracking-tight">{valeur}</p>
      {detail && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{detail}</p>}
    </motion.div>
  )
}

function Jauge({ valeur, libelle, couleur }) {
  const bornee = Math.max(0, Math.min(100, Number(valeur) || 0))
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={[{ valeur: bornee }]}
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="valeur"
              cornerRadius={12}
              fill={couleur}
              background={{ fill: 'var(--color-muted)' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold">{Math.round(bornee)} %</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{libelle}</p>
    </div>
  )
}
