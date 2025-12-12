import _ from '../node_modules/lodash-es/lodash.js'
const URL_PARAMS = 'http://localhost:8080/params_grille_nombres.php'
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const params = await chargerParametres()
    genererGrille(params)
  } catch (err) {
    console.error(err)
    alert('Erreur : impossible de charger les paramètres.')
  }
})