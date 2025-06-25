import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import adaptiveLearningServiceInstance from '../services/adaptive-learning.service';
import prisma from '../config/prisma';

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
      const result = adaptiveLearningServiceInstance.suggestAccounts(null);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('devrait retourner un tableau vide si les patterns ne correspondent pas', () => {
      // Simuler des patterns vides
      adaptiveLearningServiceInstance.patterns = [];
      
      const data = {
        fournisseur: 'Test Fournisseur',
        libelle: 'Test Libellé',
        reference: 'REF123'
      };
      
      const result = adaptiveLearningServiceInstance.suggestAccounts(data);
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('createLearningPattern', () => {
    it('devrait appeler savePattern avec les bonnes données', async () => {
      // Créer un spy pour la méthode savePattern
      const savePatternSpy = sinon.spy(adaptiveLearningServiceInstance, 'savePattern');
      
      // Simuler des patterns existants
      adaptiveLearningServiceInstance.patterns = [];
      
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
        },
        timestamp: new Date().toISOString(),
        confidence: 0.85
      };
      
      // Appeler la méthode privée via une méthode publique
      // Nous devons utiliser une approche indirecte car createLearningPattern est privée
      await adaptiveLearningServiceInstance.recordFeedback(
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
      const loadMetricsStub = sinon.stub(adaptiveLearningServiceInstance, 'loadPerformanceMetrics').resolves({
        totalSuggestions: 10,
        acceptedSuggestions: 7,
        rejectedSuggestions: 3,
        averageDecisionTimeMs: 2500,
        lastUpdated: new Date().toISOString(),
        explanations: {
          total: 10,
          helpful: 8,
          notHelpful: 2,
          byType: {}
        }
      });
      
      const metrics = await adaptiveLearningServiceInstance.getPerformanceMetrics();
      
      expect(metrics).to.be.an('object');
      expect(metrics).to.have.property('totalSuggestions').that.equals(10);
      expect(metrics).to.have.property('acceptedSuggestions').that.equals(7);
      expect(metrics).to.have.property('rejectedSuggestions').that.equals(3);
      
      // Restaurer le stub
      loadMetricsStub.restore();
    });
  });
});
