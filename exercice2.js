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
