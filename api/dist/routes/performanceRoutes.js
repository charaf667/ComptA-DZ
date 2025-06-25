"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adaptive_learning_service_1 = require("../services/adaptive-learning.service");
const router = (0, express_1.Router)();
// Note: AdaptiveLearningService est instancié ici. 
// Si c'était un service géré par un conteneur d'injection de dépendances (comme avec NestJS),
// on l'obtiendrait différemment. Pour une app Express simple, une nouvelle instance est courante.
const adaptiveLearningService = new adaptive_learning_service_1.AdaptiveLearningService();
router.get('/', (req, res) => {
    try {
        const metrics = adaptiveLearningService.getPerformanceMetrics();
        // Le frontend s'attend à une réponse de la forme { success: true, data: metrics }
        res.json({ success: true, data: metrics });
    }
    catch (error) {
        const err = error;
        console.error('Erreur lors de la récupération des métriques de performance:', err.message);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur', error: err.message });
    }
});
exports.default = router;
