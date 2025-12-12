const URL_PARAMS = 'http://localhost:8080/params_grille_nombres.php'

window.addEventListener('DOMContentLoaded', function () {
  chargerParametres()
    .then(function (params) {
      genererGrille(params)
    })
    .catch(function (err) {
      console.error(err)
      alert('Erreur : impossible de charger les paramètres.')
    })
})

function chargerParametres () {
  return fetch(URL_PARAMS)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres')
      }
      return response.json()
    })
    .then(function (json) {
      console.log('Paramètres chargés :', json)
      return json 
    })
}

// Génération de la grille HTML
function genererGrille (params) {

  var config = params.parametres_tableau

  var nbLignes = config.nombre_lignes
  var nbColonnes = config.nombre_colonnes

  var min = config.plage_nombres_aleatoires.nombre_minimum
  var max = config.plage_nombres_aleatoires.nombre_maximum

  var couleurFond = config.couleur_fond_cellule
  var couleurTexte = config.couleur_texte_cellule
  var seuil = config.nombre_base  

  var conteneur = document.querySelector('#conteneur-grille')
  var resultat = document.querySelector('#texte-resultat')

  var table = document.createElement('table')
  table.className = 'table table-bordered text-center align-middle'

  var compteurSup = 0

  for (var i = 0; i < nbLignes; i++) {
    var tr = document.createElement('tr')

    for (var j = 0; j < nbColonnes; j++) {
      var td = document.createElement('td')

      var nombre = _.random(min, max)
      td.textContent = nombre

      if (nombre > seuil) {
        compteurSup++
        td.style.backgroundColor = couleurFond
        td.style.color = couleurTexte
        td.style.fontWeight = 'bold'
      }

      tr.appendChild(td)
    }

    table.appendChild(tr)
  }

  conteneur.innerHTML = ''
  conteneur.appendChild(table)

  resultat.textContent =
    'Nombre de cellules ayant un nombre supérieur à ' + seuil + ' : ' + compteurSup
}
