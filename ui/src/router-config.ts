/**
 * Configuration des fonctionnalités futures de React Router v7
 * Cette configuration résout les avertissements concernant:
 * 1. v7_startTransition - Pour envelopper les mises à jour d'état dans React.startTransition
 * 2. v7_relativeSplatPath - Pour la résolution des routes relatives dans les routes Splat
 */
export const ROUTER_FUTURE_CONFIG = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};
