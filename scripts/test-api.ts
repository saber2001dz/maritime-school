async function testAPI() {
  try {
    console.log('🔍 Test de l\'API /api/formations...\n')

    const response = await fetch('http://localhost:3000/api/formations')

    if (!response.ok) {
      console.error('❌ Erreur HTTP:', response.status, response.statusText)
      return
    }

    const data = await response.json()

    console.log(`✅ API retourne ${data.length} formations\n`)
    console.log('═'.repeat(80))

    // Afficher les 3 premières formations
    data.slice(0, 3).forEach((f: any, index: number) => {
      console.log(`\n${index + 1}. ${f.formation}`)
      console.log(`   Type: ${f.typeFormation}`)
      console.log(`   Spécialité: ${f.specialite || 'NULL'}`)
      console.log(`   Durée: ${f.duree || 'NULL'}`)
      console.log(`   Capacité: ${f.capaciteAbsorption || 'NULL'}`)
    })

    console.log('\n' + '═'.repeat(80))

    // Vérifier les champs
    const first = data[0]
    console.log('\n📋 Structure du premier objet:')
    console.log(JSON.stringify(first, null, 2))

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testAPI()
