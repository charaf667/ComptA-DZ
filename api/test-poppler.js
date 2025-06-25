const { execSync } = require('child_process');

try {
  const output = execSync('"C:\\poppler\\Library\\bin\\pdftoppm.exe" --help');
  console.log('Poppler est installé et fonctionne correctement!');
  console.log(output.toString());
} catch (error) {
  console.error('Erreur lors de l\'exécution de pdftoppm:', error.message);
}
