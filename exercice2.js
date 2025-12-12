
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
    alert('Erreur : impossible de charger les données. Vérifiez Docker.')
  }
})

async function chargerCdpK () {
  const response = await fetch(URL_CDP_K)

  if (!response.ok) {
    throw new Error('Impossible de charger data_cdp_k.php')
  }

  cdpKData = await response.json()
  console.log('CDp/K chargés :', cdpKData)
}

async function chargerDefinitions () {
  const response = await fetch(URL_DEFINITIONS)

  if (!response.ok) {
    throw new Error('Impossible de charger definition_forces.php')
  }

  const html = await response.text()
  document.querySelector('#definitions').innerHTML = html
}

function configurerFormulaire () {
  const form = document.querySelector('#form-cd')
  const resultat = document.querySelector('#resultat')

  form.addEventListener('submit', event => {
    event.preventDefault()

    const flap = document.querySelector('#flap').value
    const m = parseFloat(document.querySelector('#mach').value)
    const cl = parseFloat(document.querySelector('#cl').value)

    if (flap !== '0' && flap !== '20' && flap !== '45') {
      alert('Veuillez choisir une position des volets : 0, 20 ou 45.')
      return
    }

    if (Number.isNaN(m) || m < 0 || m > 0.85) {
      alert('Le nombre de Mach doit être entre 0 et 0.85.')
      return
    }

    if (Number.isNaN(cl) || cl < 0.2 || cl > 1.2) {
      alert('Le coefficient Cl doit être entre 0.2 et 1.2.')
      return
    }

    try {
      const cd = calculerCD(flap, m, cl)
      resultat.textContent = `CD = ${cd.toFixed(5)}`
    } catch (err) {
      console.error(err)
      alert('Erreur dans le calcul. Vérifiez les valeurs.')
    }
  })
}

function calculerCDcomp (m, cl) {
  const cl2 = cl * cl

  if (m >= 0 && m <= 0.60) {
    return 0
  }

  if (m > 0.60 && m <= 0.78) {
    const value = 0.0508 - 0.1748 * m + 0.1504 * m * m
    return value * cl2
  }

  if (m > 0.78 && m <= 0.85) {
    const value =
      -99.3434 +
      380.888 * m -
      486.8 * m * m +
      207.408 * m * m * m

    return value * cl2
  }

  throw new Error('Mach hors limite (0 à 0.85)')
}

function calculerCD (flap, m, cl) {
  if (!cdpKData) {
    throw new Error('Les données CDp/K ne sont pas encore chargées')
  }

  const infos = cdpKData[flap]
  if (!infos) {
    throw new Error(`Aucune valeur CDp/K pour flap=${flap}`)
  }

  const cdp = parseFloat(infos.CDp)
  const k = parseFloat(infos.K)
  const cl2 = cl * cl

  const cdComp = calculerCDcomp(m, cl)

  return cdp + k * cl2 + cdComp
}
