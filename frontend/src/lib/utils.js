import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Formate un montant en FCFA (ou devise configurée). */
export function formatMontant(valeur, devise = 'FCFA') {
  const nombre = Number(valeur ?? 0)
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(nombre)} ${devise}`
}

/** Formate une date ISO en date lisible française. */
export function formatDate(valeur) {
  if (!valeur) return '—'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

/** Formate une date + heure. */
export function formatDateHeure(valeur) {
  if (!valeur) return '—'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Retourne les initiales d'un nom complet. */
export function initiales(prenom = '', nom = '') {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() || '?'
}

/** Formate un pourcentage. */
export function formatPourcentage(valeur) {
  return `${Number(valeur ?? 0).toFixed(1)} %`
}

/** Délai debounce simple. */
export function debounce(fn, delai = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delai)
  }
}

/** Palette par défaut pour les graphiques. */
export const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
