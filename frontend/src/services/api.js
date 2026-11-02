import { axiosClient } from '@/lib/axios'

/** Construit les paramètres de requête à partir d'un objet de filtres. */
function params(config = {}) {
  const { page, per_page, sort, direction, search, ...filtres } = config
  const p = {}
  if (page) p.page = page
  if (per_page) p.per_page = per_page
  if (sort) p.sort = sort
  if (direction) p.direction = direction
  if (search) p.search = search
  Object.entries(filtres).forEach(([cle, valeur]) => {
    if (valeur === undefined || valeur === null || valeur === '' || (Array.isArray(valeur) && valeur.length === 0)) {
      return
    }
    p[cle] = valeur
  })
  return p
}

export const authService = {
  connexion: (donnees) => axiosClient.post('/auth/connexion', donnees).then((r) => r.data),
  moi: () => axiosClient.get('/auth/utilisateur').then((r) => r.data.data),
  deconnexion: () => axiosClient.post('/auth/deconnexion').then((r) => r.data),
}

export const etudiantsService = {
  liste: (config) => axiosClient.get('/etudiants', { params: params(config) }).then((r) => r.data),
  detail: (id) => axiosClient.get(`/etudiants/${id}`).then((r) => r.data.data),
  creer: (donnees) => axiosClient.post('/etudiants', donnees).then((r) => r.data),
  creerFormData: (formulaire) => axiosClient.post('/etudiants', formulaire).then((r) => r.data),
  modifier: (id, donnees) => axiosClient.put(`/etudiants/${id}`, donnees).then((r) => r.data),
  modifierFormData: (id, formulaire) => axiosClient.post(`/etudiants/${id}`, formulaire).then((r) => r.data),
  supprimer: (id) => axiosClient.delete(`/etudiants/${id}`).then((r) => r.data),
  restaurer: (id) => axiosClient.post(`/etudiants/${id}/restaurer`).then((r) => r.data),
  exporter: (config) =>
    axiosClient.get('/etudiants-export/csv', { params: params(config), responseType: 'blob' }).then((r) => r.data),
}

export const formationsService = {
  liste: (config) => axiosClient.get('/formations', { params: params(config) }).then((r) => r.data),
  detail: (id) => axiosClient.get(`/formations/${id}`).then((r) => r.data.data),
  creer: (donnees) => axiosClient.post('/formations', donnees).then((r) => r.data),
  modifier: (id, donnees) => axiosClient.put(`/formations/${id}`, donnees).then((r) => r.data),
  supprimer: (id) => axiosClient.delete(`/formations/${id}`).then((r) => r.data),
}

export const categoriesService = {
  liste: (config) => axiosClient.get('/categories', { params: params(config) }).then((r) => r.data),
  detail: (id) => axiosClient.get(`/categories/${id}`).then((r) => r.data.data),
  creer: (donnees) => axiosClient.post('/categories', donnees).then((r) => r.data),
  modifier: (id, donnees) => axiosClient.put(`/categories/${id}`, donnees).then((r) => r.data),
  supprimer: (id) => axiosClient.delete(`/categories/${id}`).then((r) => r.data),
}

export const inscriptionsService = {
  liste: (config) => axiosClient.get('/inscriptions', { params: params(config) }).then((r) => r.data),
  detail: (id) => axiosClient.get(`/inscriptions/${id}`).then((r) => r.data.data),
  creer: (donnees) => axiosClient.post('/inscriptions', donnees).then((r) => r.data),
  modifier: (id, donnees) => axiosClient.put(`/inscriptions/${id}`, donnees).then((r) => r.data),
  supprimer: (id) => axiosClient.delete(`/inscriptions/${id}`).then((r) => r.data),
}

export const paiementsService = {
  liste: (config) => axiosClient.get('/paiements', { params: params(config) }).then((r) => r.data),
  creer: (donnees) => axiosClient.post('/paiements', donnees).then((r) => r.data),
  modifier: (id, donnees) => axiosClient.put(`/paiements/${id}`, donnees).then((r) => r.data),
  supprimer: (id) => axiosClient.delete(`/paiements/${id}`).then((r) => r.data),
}

export const statistiquesService = {
  tableauDeBord: (params) => axiosClient.get('/statistiques/tableau-de-bord', { params }).then((r) => r.data),
  kpis: (periode) => axiosClient.get('/statistiques/kpis', { params: periode }).then((r) => r.data),
  evolutionInscriptions: (mois = 12) =>
    axiosClient.get('/statistiques/evolution-inscriptions', { params: { mois } }).then((r) => r.data),
  repartitionStatuts: () => axiosClient.get('/statistiques/repartition-statuts').then((r) => r.data),
  repartitionSexes: () => axiosClient.get('/statistiques/repartition-sexes').then((r) => r.data),
  repartitionTranchesAge: () => axiosClient.get('/statistiques/repartition-tranches-age').then((r) => r.data),
  topFormations: (limite = 5) =>
    axiosClient.get('/statistiques/top-formations', { params: { limite } }).then((r) => r.data),
  inscriptionsParFormation: () => axiosClient.get('/statistiques/inscriptions-par-formation').then((r) => r.data),
  repartitionCategories: () => axiosClient.get('/statistiques/repartition-categories').then((r) => r.data),
  revenusMensuels: (mois = 12) =>
    axiosClient.get('/statistiques/revenus-mensuels', { params: { mois } }).then((r) => r.data),
  remplissageFormations: () => axiosClient.get('/statistiques/remplissage-formations').then((r) => r.data),
  formationsBientotCompletes: (seuil = 80) =>
    axiosClient.get('/statistiques/formations-bientot-completes', { params: { seuil } }).then((r) => r.data),
  dernieresInscriptions: (limite = 5) =>
    axiosClient.get('/statistiques/dernieres-inscriptions', { params: { limite } }).then((r) => r.data),
  paiementsRecents: (limite = 5) =>
    axiosClient.get('/statistiques/paiements-recents', { params: { limite } }).then((r) => r.data),
}
