const { expect } = require('chai');
const sinon = require('sinon');
const adaptiveLearningService = require('../services/adaptive-learning.service').default;
const prisma = require('../config/prisma').default;

describe('AdaptiveLearningService', () => {
  let queryRawStub;
  let executeRawStub;

  before(() => {
    // Créer des stubs pour les méthodes Prisma
    queryRawStub = sinon.stub(prisma, '$queryRaw');
    executeRawStub = sinon.stub(prisma, '$executeRaw');
    
    // Utiliser l'instance exportée du service
    // Pas besoin de créer une nouvelle instance
  });

  after(() => {
    // Restaurer les stubs
    queryRawStub.restore();
    executeRawStub.restore();
  });

  describe('suggestAccounts', () => {
    it('devrait retourner un tableau vide si aucune donnée n\'est fournie', () => {
      const result = adaptiveLearningService.suggestAccounts(null);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('devrait retourner un tableau vide si aucun pattern ne correspond', () => {
      // Simuler des patterns vides
      adaptiveLearningService.patterns = [];
      
      const data = {
        fournisseur: 'Test Fournisseur',
        libelle: 'Test Libellé',
        reference: 'REF123'
      };
      
      const result = adaptiveLearningService.suggestAccounts(data);
      expect(result).to.be.an('array').that.is.empty;
    });
  });
  
  describe('recordFeedback', () => {
    it('devrait appeler savePattern avec les bonnes données', async () => {
      // Créer un spy pour la méthode savePattern
      const savePatternSpy = sinon.spy(adaptiveLearningService, 'savePattern');
      
      // Simuler des patterns existants
      adaptiveLearningService.patterns = [];
      
      // Créer des données de test
      const feedback = {
        extractedData: {
          fournisseur: 'Test Fournisseur',
          libelle: 'Test Libellé',
          reference: 'REF123'
        },
        selectedAccount: {
          compteCode: '6064',
          libelleCompte: 'Fournitures administratives',
          classe: 6,
          scoreConfiance: 0.85
        }
      };
      
      // Appeler la méthode recordFeedback
      await adaptiveLearningService.recordFeedback(
        feedback.extractedData,
        feedback.selectedAccount
      );
      
      // Vérifier que savePattern a été appelé avec les bonnes données
      expect(savePatternSpy.called).to.be.true;
      
      // Restaurer le spy
      savePatternSpy.restore();
    });
  });
  
  describe('getPerformanceMetrics', () => {
    it('devrait retourner les métriques de performance', async () => {
      // Simuler le chargement des métriques
      const loadMetricsStub = sinon.stub(adaptiveLearningService, 'loadPerformanceMetrics').resolves({
        totalSuggestions: 10,
        acceptedSuggestions: 7,
        rejectedSuggestions: 3,
        acceptanceRate: 0.7,
        topAccountsUsage: {
          '6064': 5,
          '6063': 3,
          '6065': 2
        },
        averageConfidenceScore: 0.85
      });
      
      const metrics = await adaptiveLearningService.getPerformanceMetrics();
      
      expect(metrics).to.be.an('object');
      expect(metrics).to.have.property('totalSuggestions').that.equals(10);
      expect(metrics).to.have.property('acceptedSuggestions').that.equals(7);
      expect(metrics).to.have.property('rejectedSuggestions').that.equals(3);
      expect(metrics).to.have.property('acceptanceRate').that.equals(0.7);
      expect(metrics).to.have.property('topAccountsUsage').that.is.an('object');
      expect(metrics).to.have.property('averageConfidenceScore').that.equals(0.85);
      
      // Restaurer le stub
      loadMetricsStub.restore();
    });
  });
});
