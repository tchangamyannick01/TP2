const URL_CDP_K = 'http://localhost:8080/data_cdp_k.php'
const URL_DEFINITIONS = 'http://localhost:8080/definition_forces.php'

let cdpKData = null 

window.addEventListener('DOMContentLoaded', function () {
  console.log('DOM chargé, début de l’initialisation…')

  Promise.all([
    chargerCdpK(),
    chargerDefinitions()
  ])
    .then(function () {
      console.log('Données chargées, configuration du formulaire.')
      configurerFormulaire()
    })
    .catch(function (err) {
      console.error(err)
      alert('Erreur : impossible de charger les données nécessaires.')
    })
})

// Chargement des valeurs CDp / K

function chargerCdpK () {
  return fetch(URL_CDP_K)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Impossible de charger data_cdp_k.php')
      }
      return response.json()
    })
    .then(function (json) {
      cdpKData = json.data_cdp_k
      console.log('Données CDp/K chargées :', cdpKData)
    })
}

// Chargement et affichage des définitions de forces

function chargerDefinitions () {
  return fetch(URL_DEFINITIONS)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Impossible de charger definition_forces.php')
      }
      return response.json()
    })
    .then(function (json) {

      const div = document.querySelector('#definitions')

      let html = '<h4 class="mb-3">Définition des forces</h4><ul class="ps-3">'

      json.definition_forces.forEach(function (item) {
        html += `
          <li class="mb-2">
            <strong>${item.force} :</strong> ${item.definition}
          </li>
        `
      })

      html += '</ul>'

      div.innerHTML = html
    })
}

// Formulaire : validation et calcul

function configurerFormulaire () {
  const form = document.querySelector('#form-cd')
  const resultat = document.querySelector('#resultat')

  form.addEventListener('submit', function (event) {
    event.preventDefault()

    const flap = document.querySelector('#flap').value
    const m = parseFloat(document.querySelector('#mach').value)
    const cl = parseFloat(document.querySelector('#cl').value)

    //validations
    if (flap !== '0' && flap !== '20' && flap !== '45') {
      alert('Veuillez choisir une position de volets : 0, 20 ou 45.')
      return
    }

    if (Number.isNaN(m) || m < 0 || m > 0.85) {
      alert('Le nombre de Mach doit être entre 0 et 0.85.')
      return
    }

    if (Number.isNaN(cl) || cl < 0.2 || cl > 1.2) {
      alert('Le coefficient de portance Cl doit être entre 0.2 et 1.2.')
      return
    }

    try {
      const cd = calculerCD(flap, m, cl)
      resultat.textContent = 'CD = ' + cd.toFixed(5)
    } catch (err) {
      console.error(err)
      alert('Erreur pendant le calcul : ' + err.message)
    }
  })
}

// Calcul de CDcomp selon M 

function calculerCDcomp (m, cl) {
  const cl2 = cl * cl

  if (m >= 0 && m <= 0.60) {
    return 0
  }

  if (m > 0.60 && m <= 0.78) {
    const value1 = 0.0508 - 0.1748 * m + 0.1504 * m * m
    return value1 * cl2
  }

  if (m > 0.78 && m <= 0.85) {
    const value2 =
      -99.3434 +
      380.888 * m -
      486.8 * m * m +
      207.408 * m * m * m
    return value2 * cl2
  }

  throw new Error('Mach hors plage (0 à 0.85)')
}

// CD = CDp + K * Cl² + CDcomp

function indexPourFlap (flap) {
  if (flap === '0') return 0
  if (flap === '20') return 1
  if (flap === '45') return 2
  throw new Error('Flap inconnu : ' + flap)
}

function calculerCD (flap, m, cl) {
  if (!cdpKData) {
    throw new Error('Les données CDp/K ne sont pas chargées')
  }

  console.log('Calcul CD pour flap=' + flap + ', M=' + m + ', Cl=' + cl)

  const idx = indexPourFlap(flap)

  const cdp = parseFloat(cdpKData.cdp[idx])
  const k = parseFloat(cdpKData.k[idx])
  const cl2 = cl * cl

  console.log('cdp utilisé =', cdp, 'k utilisé =', k, 'index =', idx)

  const cdComp = calculerCDcomp(m, cl)

  return cdp + k * cl2 + cdComp
}
