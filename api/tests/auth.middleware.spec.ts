import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock AdaptiveLearningService BEFORE importing routes
jest.mock('../src/services/adaptive-learning.service', () => {
  return {
    AdaptiveLearningService: jest.fn().mockImplementation(() => ({
      getPerformanceMetrics: jest.fn().mockResolvedValue({}),
    })),
  };
});
import express from 'express';
// Silence console to avoid "Cannot log after tests are done" warnings
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
import performanceRoutes from '../src/routes/performanceRoutes';

// Crée une instance Express minimale pour les tests
const app = express();
app.use(express.json());
app.use('/api/performance-metrics', performanceRoutes);

// Variables communes
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const TENANT_1 = '11111111-1111-1111-1111-111111111111';
const TENANT_2 = '22222222-2222-2222-2222-222222222222';

const tokenForTenant = (tenantId: string) =>
  jwt.sign({ user: { id: `user-${tenantId}` }, tenant: { id: tenantId } }, JWT_SECRET, {
    expiresIn: '1h'
  });

describe('Auth middleware & route protection', () => {
  it('should reject request without Authorization header', async () => {
    const res = await request(app).get('/api/performance-metrics');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/performance-metrics')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('should allow request with valid JWT', async () => {
    const res = await request(app)
      .get('/api/performance-metrics')
      .set('Authorization', `Bearer ${tokenForTenant(TENANT_1)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should isolate tenants when calling service', async () => {
    // Espionner la méthode getPerformanceMetrics pour vérifier lʼID du tenant reçu
    const { AdaptiveLearningService } = require('../src/services/adaptive-learning.service');
    const instance = (AdaptiveLearningService as jest.Mock).mock.results[0].value;

    await request(app)
      .get('/api/performance-metrics')
      .set('Authorization', `Bearer ${tokenForTenant(TENANT_2)}`);

    expect(instance.getPerformanceMetrics).toHaveBeenCalledWith(TENANT_2);
  });
});
