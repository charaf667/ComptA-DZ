import adaptiveLearningService from '../services/adaptive-learning.service';

// Fonction pour tester le service
async function testAdaptiveLearningService() {
  console.log('=== Test du service AdaptiveLearningService ===');
  
  // Test 1: suggestAccounts avec données undefined
  console.log('\nTest 1: suggestAccounts avec données undefined');
  const result1 = adaptiveLearningService.suggestAccounts(undefined as any);
  console.log('Résultat:', result1);
  console.log('Test réussi:', Array.isArray(result1) && result1.length === 0);
  
  // Test 2: suggestAccounts avec données valides mais sans patterns correspondants
  console.log('\nTest 2: suggestAccounts avec données valides mais sans patterns correspondants');
  // Accès à la propriété privée via une assertion de type
  (adaptiveLearningService as any).patterns = [];
  const data = {
    fournisseur: 'Test Fournisseur',
    libelle: 'Test Libellé',
    reference: 'REF123',
    confidence: 0.8
  };
  const result2 = adaptiveLearningService.suggestAccounts(data);
  console.log('Résultat:', result2);
  console.log('Test réussi:', Array.isArray(result2) && result2.length === 0);
  
  // Test 3: recordFeedback avec données valides
  console.log('\nTest 3: recordFeedback avec données valides');
  try {
    await adaptiveLearningService.recordFeedback(
      {
        fournisseur: 'Test Fournisseur',
        libelle: 'Test Libellé',
        reference: 'REF123',
        confidence: 0.8
      },
      {
        compteCode: '6064',
        libelleCompte: 'Fournitures administratives',
        classe: 6,
        scoreConfiance: 0.85,
        justification: 'Test de justification'
      }
    );
    console.log('Test réussi: Pas d\'erreur lors de l\'appel à recordFeedback');
  } catch (error) {
    console.error('Test échoué:', error);
  }
  
  // Test 4: getPerformanceMetrics
  console.log('\nTest 4: getPerformanceMetrics');
  try {
    const metrics = await adaptiveLearningService.getPerformanceMetrics();
    console.log('Métriques de performance:', metrics);
    console.log('Test réussi:', metrics && typeof metrics === 'object');
  } catch (error) {
    console.error('Test échoué:', error);
  }
  
  console.log('\n=== Tests terminés ===');
}

// Exécuter les tests
testAdaptiveLearningService().catch(console.error);
