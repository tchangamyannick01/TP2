const URL_CDP_K = 'http://localhost:8080/data_cdp_k.php'
const URL_DEFINITIONS = 'http://localhost:8080/definition_forces.php'

let cdpKData = null
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await chargerCdpK()
    await chargerDefinitions()
    configurerFormulaire()
  } catch (err) {
    console.error(err)
    alert('Erreur de chargement des données. Vérifie Docker / URLs.')
  }
})

async function chargerCdpK () {
  const response = await fetch(URL_CDP_K)

  if (!response.ok) {
    throw new Error('Impossible de charger data_cdp_k.php')
  }

  // On suppose que le PHP renvoie du JSON
  cdpKData = await response.json()

  console.log('Données CDp/K chargées :', cdpKData)
}

async function chargerDefinitions () {
  const response = await fetch(URL_DEFINITIONS)

  if (!response.ok) {
    throw new Error('Impossible de charger definition_forces.php')
  }

  const html = await response.text()
  const definitionsDiv = document.querySelector('#definitions')
  definitionsDiv.innerHTML = html
}
function configurerFormulaire () {
  const form = document.querySelector('#form-cd')
  const resultat = document.querySelector('#resultat')

  form.addEventListener('submit', event => {
    event.preventDefault()

    const flapSelect = document.querySelector('#flap')
    const machInput = document.querySelector('#mach')
    const clInput = document.querySelector('#cl')

    const flap = flapSelect.value
    const m = parseFloat(machInput.value)
    const cl = parseFloat(clInput.value)

    // Validation simple
    if (flap !== '0' && flap !== '20' && flap !== '45') {
      alert('Veuillez choisir une position de volets (0, 20 ou 45).')
      return
    }

    if (Number.isNaN(m) || m < 0 || m > 0.85) {
      alert('Le nombre de Mach doit être entre 0 et 0.85.')
      return
    }

    if (Number.isNaN(cl) || cl < 0.2 || cl > 1.2) {
      alert('Cl doit être entre 0.2 et 1.2.')
      return
    }

    const cd = calculerCD(flap, m, cl)

    resultat.textContent = `CD = ${cd.toFixed(5)}`
  })
}
function calculerCDcomp (m, cl) {
  const cl2 = cl * cl

  if (m >= 0 && m <= 0.60) {
    return 0
  } else if (m > 0.60 && m <= 0.78) {
    const valeur = 0.0508 - 0.1748 * m + 0.1504 * m * m
    return valeur * cl2
  } else if (m > 0.78 && m <= 0.85) {
    const valeur = -99.3434 + 380.888 * m - 486.8 * m * m + 207.408 * m * m * m
    return valeur * cl2
  } else {
    
    throw new Error('M hors plage 0–0.85')
  }
}
function calculerCD (flap, m, cl) {
  if (!cdpKData) {
    throw new Error('Les données CDp/K ne sont pas chargées')
  }

  const infosFlap = cdpKData[flap]
  if (!infosFlap) {
    throw new Error(`Aucune donnée CDp/K pour flap=${flap}`)
  }

  const cdp = parseFloat(infosFlap.CDp)
  const k = parseFloat(infosFlap.K)
  const cl2 = cl * cl

  const cdComp = calculerCDcomp(m, cl)
  const cd = cdp + k * cl2 + cdComp

  return cd
}
