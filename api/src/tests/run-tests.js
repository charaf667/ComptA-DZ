/**
 * Script pour exécuter les tests après compilation des fichiers TypeScript
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Chemin vers le répertoire racine du projet
const rootDir = path.join(__dirname, '../..');

// Vérifier si le répertoire de compilation existe
function checkCompiledFiles() {
  const distDir = path.join(rootDir, 'dist');
  const serviceDir = path.join(distDir, 'services');
  const versionServicePath = path.join(serviceDir, 'document-version.service.js');
  
  if (!fs.existsSync(versionServicePath)) {
    console.log('🔄 Les fichiers compilés ne sont pas trouvés. Compilation en cours...');
    
    try {
      // Exécuter la compilation TypeScript
      execSync('npx tsc', { 
        cwd: rootDir, 
        stdio: 'inherit' 
      });
      console.log('✅ Compilation terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la compilation:', error);
      process.exit(1);
    }
  } else {
    console.log('✅ Fichiers compilés trouvés');
  }
}

// Exécuter le script de test spécifique
function runTest(testScript) {
  const testPath = path.join(__dirname, testScript);
  
  try {
    console.log(`🧪 Exécution du test: ${testScript}`);
    
    // Remplacer process.env.NODE_ENV pour les tests
    const env = { ...process.env, NODE_ENV: 'test' };
    
    execSync(`node ${testPath}`, { 
      cwd: rootDir, 
      stdio: 'inherit',
      env 
    });
    
    console.log(`✅ Test terminé avec succès: ${testScript}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution du test ${testScript}:`, error);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('🚀 Lancement des tests pour le système de versionnage des documents');
  
  // S'assurer que les fichiers sont compilés
  checkCompiledFiles();
  
  // Exécuter les tests
  const testScript = 'document-version.test.js';
  const success = runTest(testScript);
  
  // Afficher le résultat final
  if (success) {
    console.log('\n🎉 Tous les tests ont été exécutés avec succès');
    process.exit(0);
  } else {
    console.log('\n❌ Certains tests ont échoué');
    process.exit(1);
  }
}

// Exécuter le script
main();
