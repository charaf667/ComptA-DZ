import { Router, Request, Response, NextFunction } from 'express';
import { AccountController } from '../controllers/account.controller';
import accountValidationRules from '../validators/account.validator';
import authMiddleware from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleMiddleware';
import { tenantIsolation } from '../middlewares/tenantIsolationMiddleware';
import { AuthRequest } from '../middlewares/authMiddleware';

// Wrapper pour gérer les erreurs de type avec Express
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

// CRUD routes for accounts
router.post(
  '/',
  authMiddleware,
  tenantIsolation(),
  accountValidationRules.createAccount,
  asyncHandler(AccountController.createAccount)
);

router.get(
  '/',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  asyncHandler(AccountController.getAccounts)
);

router.get(
  '/:id',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  accountValidationRules.getAccount,
  asyncHandler(AccountController.getAccountById)
);

router.put(
  '/:id',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  accountValidationRules.updateAccount,
  asyncHandler(AccountController.updateAccount)
);

router.delete(
  '/:id',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  accountValidationRules.deleteAccount,
  asyncHandler(AccountController.deleteAccount)
);

// Import default chart of accounts
router.post(
  '/import-default',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  asyncHandler(AccountController.importDefaultChartOfAccounts)
);

// Import chart of accounts from CSV
import { upload } from '../controllers/account.controller';
router.post(
  '/import-csv',
  authMiddleware,
  tenantIsolation(),
  requireRoles('ACCOUNTANT','ADMIN'),
  upload.single('file'),
  asyncHandler(AccountController.importChartOfAccountsFromCsv)
);

export default router;
