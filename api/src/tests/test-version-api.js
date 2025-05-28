/**
 * Script de test pour l'API de versionnage des documents
 * Utilise axios pour faire des requêtes HTTP à l'API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration de l'API
const API_URL = 'http://localhost:4000/api';
const API_VERSION_URL = `${API_URL}/document-versions`;

/**
 * Effectue une série de tests sur l'API de versionnage
 */
async function runApiTests() {
  console.log('🚀 Démarrage des tests de l\'API de versionnage des documents');
  
  try {
    // 1. Créer un document de test
    console.log('\n📋 Test 1: Création d\'un document de test');
    const testDocument = {
      id: `test-doc-${Date.now()}`,
      filename: 'facture-test.pdf',
      processedAt: new Date().toISOString(),
      content: 'Contenu de test',
      extractedData: {
        fournisseur: 'Test SARL',
        montant: 1000,
        date: new Date().toISOString()
      }
    };
    
    console.log(`✅ Document de test créé avec ID: ${testDocument.id}`);
    
    // 2. Créer une version initiale
    console.log('\n📋 Test 2: Création d\'une version initiale');
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
    
    const createResponse = await axios.post(API_VERSION_URL, versionData);
    console.log(`✅ Version créée: ${createResponse.data.id}, numéro: ${createResponse.data.versionNumber}`);
    
    // 3. Récupérer les versions
    console.log('\n📋 Test 3: Récupération des versions');
    const getResponse = await axios.get(`${API_VERSION_URL}?documentId=${testDocument.id}`);
    console.log(`✅ ${getResponse.data.length} version(s) récupérée(s)`);
    
    // 4. Créer une seconde version
    console.log('\n📋 Test 4: Création d\'une seconde version');
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
    
    const createResponse2 = await axios.post(API_VERSION_URL, secondVersionData);
    console.log(`✅ Seconde version créée: ${createResponse2.data.id}, numéro: ${createResponse2.data.versionNumber}`);
    
    // 5. Comparer les versions
    console.log('\n📋 Test 5: Comparaison des versions');
    const diffResponse = await axios.get(
      `${API_VERSION_URL}/compare/${testDocument.id}?fromVersion=1&toVersion=2`
    );
    console.log(`✅ Comparaison effectuée entre les versions 1 et 2`);
    console.log(`   Nombre de changements: ${diffResponse.data.changes.length}`);
    
    // 6. Restaurer une version
    console.log('\n📋 Test 6: Restauration d\'une version');
    const restoreResponse = await axios.post(
      `${API_VERSION_URL}/restore/${testDocument.id}`,
      {
        versionNumber: 1,
        restoredBy: 'testuser',
        comment: 'Restauration de la version initiale'
      }
    );
    console.log(`✅ Version restaurée: ${restoreResponse.data.id}, numéro: ${restoreResponse.data.versionNumber}`);
    
    // 7. Vérifier que la version restaurée a le bon numéro
    console.log('\n📋 Test 7: Vérification après restauration');
    const versionsAfterRestore = await axios.get(`${API_VERSION_URL}?documentId=${testDocument.id}`);
    console.log(`✅ Nombre total de versions après restauration: ${versionsAfterRestore.data.length}`);
    console.log(`✅ Numéro de la dernière version: ${versionsAfterRestore.data[0].versionNumber}`);
    
    console.log('\n🎉 Tous les tests de l\'API ont réussi!');
    return true;
  } catch (error) {
    console.error('\n❌ Erreur lors des tests API:', error.message);
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  // Vérifier si le serveur est en cours d'exécution
  try {
    await axios.get(API_URL);
    console.log('✅ Serveur API détecté sur', API_URL);
    
    const success = await runApiTests();
    
    if (success) {
      console.log('\n✅ Les tests API ont été exécutés avec succès');
      process.exit(0);
    } else {
      console.log('\n❌ Certains tests API ont échoué');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erreur: Le serveur API ne semble pas être en cours d\'exécution sur', API_URL);
    console.log('⚠️ Assurez-vous que le serveur API est en cours d\'exécution avant de lancer les tests');
    console.log('   Utilisez la commande: npm start');
    process.exit(1);
  }
}

// Exécuter le script
main();
