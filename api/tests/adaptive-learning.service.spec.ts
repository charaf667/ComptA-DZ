import { AdaptiveLearningService } from '../src/services/adaptive-learning.service';
import { PrismaClient } from '@prisma/client';
import accountRepo from '../src/repositories/account.repository';
import { ExtractedData } from '../src/types/ocr';

// Mock des dépendances
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    learningPattern: {
      findMany: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('../src/repositories/account.repository', () => ({
  findIdByCode: jest.fn(),
  upsertCoreAccount: jest.fn(),
}));

describe('AdaptiveLearningService', () => {
  let service: AdaptiveLearningService;
  let prisma: any;
  const tenantId = '00000000-0000-0000-0000-000000000111';

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    service = new AdaptiveLearningService();
    
    // Mock loadPatterns (méthode privée)
    (service as any).loadPatterns = jest.fn().mockResolvedValue([
      {
        pattern: 'fournisseur',
        accountId: 'acc123',
        accountCode: '401',
        occurrences: 3,
        confidence: 0.85,
        lastUsed: new Date(),
      },
      {
        pattern: 'banque',
        accountId: 'acc456',
        accountCode: '512',
        occurrences: 3,
        confidence: 0.8,
        lastUsed: new Date(),
      },
    ]);
  });

  describe('suggestAccounts', () => {
    it('should return suggestions based on text content', async () => {
      // Arrange
      const extractedData: ExtractedData = {
        text: 'Paiement fournisseur',
        libelle: 'Paiement fournisseur',
        montantHT: 0,
        montantTTC: 0,
        dateFacture: new Date().toISOString(),
        fournisseur: '',
        referenceFacture: '',
        tva: 0,
        confidence: 0
      };
      
      // Act
      const result = await service.suggestAccounts(tenantId, extractedData);
      
      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect((result[0] as any).compteCode).toBe('401');
      expect((result[0] as any).scoreConfiance).toBeGreaterThan(0);
    });

    it('should return empty array when no matches found', async () => {
      // Arrange
      const extractedData: ExtractedData = {
        text: 'texte sans mot clé',
        libelle: 'texte sans mot clé',
        montantHT: 0,
        montantTTC: 0,
        dateFacture: new Date().toISOString(),
        fournisseur: '',
        referenceFacture: '',
        tva: 0,
        confidence: 0
      };
      
      // Act
      const result = await service.suggestAccounts(tenantId, extractedData);
      
      // Assert
      expect(result).toHaveLength(0);
    });

    it('should filter suggestions by tenant ID', async () => {
      // Arrange
      const wrongTenantId = '00000000-0000-0000-0000-000000000999';
      const extractedData: ExtractedData = {
        text: 'facture fournisseur',
        libelle: 'facture fournisseur',
        montantHT: 0,
        montantTTC: 0,
        dateFacture: new Date().toISOString(),
        fournisseur: '',
        referenceFacture: '',
        tva: 0,
        confidence: 0
      };
      
      // Mock loadPatterns pour simuler qu'aucun pattern n'existe pour ce tenant
      (service as any).loadPatterns = jest.fn().mockResolvedValue([]);
      
      // Act
      const result = await service.suggestAccounts(wrongTenantId, extractedData);
      
      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
