// Configuration des futures flags pour React Router v7
// Cela permet de supprimer les avertissements dans la console

// Définition des futures flags
window.__reactRouterFutureFlags = {
  // Enveloppe les mises à jour d'état dans React.startTransition
  v7_startTransition: true,
  
  // Change la résolution des routes relatives dans les routes Splat
  v7_relativeSplatPath: true
};

// Note: Ce fichier doit être importé avant toute utilisation de react-router-dom
console.log('React Router future flags configurés avec succès');
