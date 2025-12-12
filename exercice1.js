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
async function chargerParametres () {
  const response = await fetch(URL_PARAMS)

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des paramètres')
  }

  const json = await response.json()
  console.log('Paramètres chargés :', json)

  return json 
}
function genererGrille (params) {
  const nbLignes = params.nombre_lignes
  const nbColonnes = params.nombre_colonnes

  const conteneur = document.querySelector('#conteneur-grille')
  const resultat = document.querySelector('#texte-resultat')

  const table = document.createElement('table')
  table.className = 'table table-bordered text-center align-middle'

  let compteurSup80 = 0

  for (let i = 0; i < nbLignes; i++) {
    const tr = document.createElement('tr')

    for (let j = 0; j < nbColonnes; j++) {
      const td = document.createElement('td')
      const nombre = _.random(10, 90)
      td.textContent = nombre
      if (nombre > 80) {
        compteurSup80++
        td.style.backgroundColor = 'rgb(5,173,131)'
        td.style.color = 'rgb(255,255,255)'
        td.style.fontWeight = 'bold'
      }

      tr.appendChild(td)
    }

    table.appendChild(tr)
  }
  conteneur.innerHTML = ''
  conteneur.appendChild(table)
  resultat.textContent =
    `Nombre de cellules ayant une valeur supérieure à 80 : ${compteurSup80}`
}