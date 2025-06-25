import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';

// Mock controllers to éviter l'accès DB et renvoyer des réponses simples
jest.mock('../src/controllers/adaptive-learning.controller', () => ({
  recordFeedbackController: jest.fn(async (req, res) => {
    res.json({ success: true });
  }),
  suggestAccountsController: jest.fn(),
}));

jest.mock('../src/controllers/account.controller', () => {
  const getAccounts = jest.fn(async (req, res) => {
    res.json([]);
  });
  return {
    AccountController: {
      getAccounts,
      createAccount: jest.fn(),
      getAccountById: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
      importDefaultChartOfAccounts: jest.fn(),
      importChartOfAccountsFromCsv: jest.fn(),
    },
    upload: { single: () => (req: any, res: any, next: any) => next() },
  };
});

// Import des routes après le mock
import adaptiveLearningRoutes from '../src/routes/adaptiveLearningRoutes';
import accountRoutes from '../src/routes/account.routes';

// Express app minimal
const app = express();
app.use(express.json());
app.use('/api/adaptive-learning', adaptiveLearningRoutes);
app.use('/api/accounts', accountRoutes);

// Aide JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const TENANT_1 = '11111111-1111-1111-1111-111111111111';
const TENANT_2 = '22222222-2222-2222-2222-222222222222';
const tokenForTenant = (tenantId: string) =>
  jwt.sign({ user: { id: `user-${tenantId}` }, tenant: { id: tenantId } }, JWT_SECRET, {
    expiresIn: '1h',
  });

// Silence console dans tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const { recordFeedbackController } = require('../src/controllers/adaptive-learning.controller');
const { AccountController } = require('../src/controllers/account.controller');

describe('Route protection & multi-tenant isolation', () => {
  describe('/api/adaptive-learning/feedback', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app).post('/api/adaptive-learning/feedback');
      expect(res.status).toBe(401);
    });

    it('should call controller with correct tenant', async () => {
      await request(app)
        .post('/api/adaptive-learning/feedback')
        .set('Authorization', `Bearer ${tokenForTenant(TENANT_1)}`)
        .send({ patternId: 'p1', action: 'accepted' });

      expect(recordFeedbackController).toHaveBeenCalled();
      const reqArg = (recordFeedbackController as jest.Mock).mock.calls[0][0];
      expect(reqArg.tenant.id).toBe(TENANT_1);
    });
  });

  describe('/api/accounts', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app).get('/api/accounts');
      expect(res.status).toBe(401);
    });

    it('should call getAccounts with correct tenant', async () => {
      await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${tokenForTenant(TENANT_2)}`);

      const getAccounts = AccountController.getAccounts as jest.Mock;
      expect(getAccounts).toHaveBeenCalled();
      const reqArg = getAccounts.mock.calls[0][0];
      expect(reqArg.tenant.id).toBe(TENANT_2);
    });
  });
});
