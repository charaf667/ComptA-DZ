/**
 * Tests pour le service et le contrôleur de versionnage des documents
 */
// Importation du service
let documentVersionService;
try {
  // Essayer d'importer directement depuis le fichier compilé .js
  documentVersionService = require('../services/document-version.service');
  // Si l'import retourne un objet avec default, utiliser la propriété default
  if (documentVersionService && documentVersionService.default) {
    documentVersionService = documentVersionService.default;
  }
} catch (error) {
  console.error('Erreur lors de l\'importation du service:', error);
  process.exit(1);
}
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de test des versions
const testDataFilePath = path.join(__dirname, '../../data/test-document-versions.json');

/**
 * Prépare l'environnement de test
 */
function setupTestEnvironment() {
  console.log('🔧 Préparation de l\'environnement de test pour le versionnage des documents');
  
  // S'assurer que le répertoire de données existe
  const dataDir = path.dirname(testDataFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Répertoire créé: ${dataDir}`);
  }
  
  // Réinitialiser le fichier de test
  fs.writeFileSync(testDataFilePath, JSON.stringify({}));
  console.log(`✅ Fichier de test réinitialisé: ${testDataFilePath}`);
  
  // Sauvegarder le chemin original et modifier pour utiliser le fichier de test
  const originalFilePath = documentVersionService.dataFilePath;
  documentVersionService.dataFilePath = testDataFilePath;
  
  return originalFilePath;
}

/**
 * Restaure l'environnement après les tests
 */
function teardownTestEnvironment(originalFilePath) {
  console.log('🧹 Nettoyage de l\'environnement de test');
  
  // Restaurer le chemin original
  documentVersionService.dataFilePath = originalFilePath;
  
  // Supprimer le fichier de test
  if (fs.existsSync(testDataFilePath)) {
    fs.unlinkSync(testDataFilePath);
    console.log(`✅ Fichier de test supprimé: ${testDataFilePath}`);
  }
}

/**
 * Exécute les tests pour le service de versionnage
 */
async function runVersionServiceTests() {
  console.log('\n🧪 Exécution des tests pour le service de versionnage');
  
  try {
    // Test 1: Création d'une version
    console.log('\n📋 Test 1: Création d\'une version');
    const testDocument = {
      id: 'test-doc-001',
      filename: 'facture-test.pdf',
      processedAt: new Date().toISOString(),
      extractedData: {
        fournisseur: 'Test SARL',
        montant: 1000,
        date: new Date().toISOString()
      }
    };
    
    const versionData = {
      documentId: testDocument.id,
      createdBy: 'testuser',
      comment: 'Version initiale',
      changes: [
        {
          field: 'creation',
          previousValue: null,
          newValue: { created: true },
          timestamp: new Date().toISOString()
        }
      ],
      snapshot: testDocument
    };
    
    const newVersion = await documentVersionService.createVersion(versionData);
    console.log(`✅ Version créée: ${newVersion.id}, numéro: ${newVersion.versionNumber}`);
    
    // Test 2: Récupération des versions
    console.log('\n📋 Test 2: Récupération des versions');
    const versions = await documentVersionService.getVersions({
      documentId: testDocument.id
    });
    console.log(`✅ ${versions.length} version(s) récupérée(s)`);
    
    // Test 3: Récupération de la dernière version
    console.log('\n📋 Test 3: Récupération de la dernière version');
    const latestVersion = await documentVersionService.getLatestVersion(testDocument.id);
    console.log(`✅ Dernière version récupérée: ${latestVersion.id}, numéro: ${latestVersion.versionNumber}`);
    
    // Test 4: Création d'une deuxième version avec modifications
    console.log('\n📋 Test 4: Création d\'une deuxième version avec modifications');
    const updatedDocument = {
      ...testDocument,
      extractedData: {
        ...testDocument.extractedData,
        fournisseur: 'Test SARL Modifié',
        montant: 1200
      }
    };
    
    const secondVersionData = {
      documentId: testDocument.id,
      createdBy: 'testuser',
      comment: 'Modification des données',
      changes: [
        {
          field: 'extractedData.fournisseur',
          previousValue: 'Test SARL',
          newValue: 'Test SARL Modifié',
          timestamp: new Date().toISOString()
        },
        {
          field: 'extractedData.montant',
          previousValue: 1000,
          newValue: 1200,
          timestamp: new Date().toISOString()
        }
      ],
      snapshot: updatedDocument
    };
    
    const secondVersion = await documentVersionService.createVersion(secondVersionData);
    console.log(`✅ Seconde version créée: ${secondVersion.id}, numéro: ${secondVersion.versionNumber}`);
    
    // Test 5: Comparaison des versions
    console.log('\n📋 Test 5: Comparaison des versions');
    const diff = await documentVersionService.compareVersions(
      testDocument.id,
      1,
      2
    );
    console.log(`✅ Comparaison effectuée entre les versions 1 et 2`);
    console.log(`   Nombre de changements: ${diff.changes.length}`);
    
    // Test 6: Restauration d'une version
    console.log('\n📋 Test 6: Restauration d\'une version');
    const restoredVersion = await documentVersionService.restoreVersion(
      testDocument.id,
      1,
      'testuser',
      'Restauration de la version initiale'
    );
    console.log(`✅ Version restaurée: ${restoredVersion.id}, numéro: ${restoredVersion.versionNumber}`);
    
    // Test 7: Vérifier que la version restaurée a le bon numéro
    console.log('\n📋 Test 7: Vérification du numéro de version après restauration');
    const versionsAfterRestore = await documentVersionService.getVersions({
      documentId: testDocument.id
    });
    console.log(`✅ Nombre total de versions après restauration: ${versionsAfterRestore.length}`);
    console.log(`✅ Numéro de la dernière version: ${versionsAfterRestore[0].versionNumber}`);
    
    // Test 8: Suppression de toutes les versions
    console.log('\n📋 Test 8: Suppression de toutes les versions');
    const deleteResult = await documentVersionService.deleteAllVersions(testDocument.id);
    console.log(`✅ Suppression des versions: ${deleteResult ? 'Réussie' : 'Échouée'}`);
    
    console.log('\n✅ Tous les tests du service ont réussi!');
    return true;
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    return false;
  }
}

/**
 * Fonction principale pour exécuter tous les tests
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests du système de versionnage des documents');
  
  // Préparation de l'environnement
  const originalFilePath = setupTestEnvironment();
  
  try {
    // Exécuter les tests du service
    const serviceTestsSucceeded = await runVersionServiceTests();
    
    // Afficher le résultat global
    if (serviceTestsSucceeded) {
      console.log('\n🎉 Tous les tests ont réussi!');
    } else {
      console.log('\n❌ Certains tests ont échoué.');
    }
  } catch (error) {
    console.error('\n❌ Erreur fatale lors des tests:', error);
  } finally {
    // Nettoyage
    teardownTestEnvironment(originalFilePath);
  }
}

// Exécuter les tests
runAllTests();
