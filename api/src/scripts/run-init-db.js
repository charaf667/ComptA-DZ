#!/usr/bin/env node

/**
 * Script exécutable pour initialiser la base de données
 * Utilisation:
 *   - node run-init-db.js                 (initialisation basique)
 *   - node run-init-db.js --with-accounts (initialisation avec plan comptable)
 */

// Analyser les arguments de la ligne de commande
const withAccounts = process.argv.includes('--with-accounts');

async function main() {
  console.log('=== Script d\'initialisation de la base de données ComptaDZ ===');
  
  try {
    // Utiliser ts-node pour exécuter les scripts TypeScript directement
    const { execSync } = require('child_process');
    const path = require('path');
    
    // Chemins absolus vers les scripts
    const basicScriptPath = path.resolve(__dirname, 'init-db.ts');
    const fullScriptPath = path.resolve(__dirname, 'init-db-with-accounts.ts');
    
    if (withAccounts) {
      console.log('Mode: Initialisation complète (tenant + utilisateur + plan comptable)');
      console.log(`Exécution du script: ${fullScriptPath}`);
      
      // Exécuter le script avec ts-node
      execSync(`npx ts-node "${fullScriptPath}"`, { stdio: 'inherit' });
    } else {
      console.log('Mode: Initialisation basique (tenant + utilisateur)');
      console.log(`Exécution du script: ${basicScriptPath}`);
      
      // Exécuter le script avec ts-node
      execSync(`npx ts-node "${basicScriptPath}"`, { stdio: 'inherit' });
    }
    
    console.log('\n✅ Base de données initialisée avec succès!');
    console.log('\nVous pouvez maintenant vous connecter avec:');
    console.log('Email:    admin@comptadz.com');
    console.log('Password: Admin@123');
    
  } catch (error) {
    console.error('\n❌ Échec de l\'initialisation:', error);
    process.exit(1);
  }
}

main();
