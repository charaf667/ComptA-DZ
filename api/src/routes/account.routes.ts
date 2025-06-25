import { Router, Request, Response, NextFunction } from 'express';
import { AccountController } from '../controllers/account.controller';
import accountValidationRules from '../validators/account.validator';
import authMiddleware from '../middlewares/authMiddleware';
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
  accountValidationRules.createAccount,
  asyncHandler(AccountController.createAccount)
);

router.get(
  '/',
  authMiddleware,
  asyncHandler(AccountController.getAccounts)
);

router.get(
  '/:id',
  authMiddleware,
  accountValidationRules.getAccount,
  asyncHandler(AccountController.getAccountById)
);

router.put(
  '/:id',
  authMiddleware,
  accountValidationRules.updateAccount,
  asyncHandler(AccountController.updateAccount)
);

router.delete(
  '/:id',
  authMiddleware,
  accountValidationRules.deleteAccount,
  asyncHandler(AccountController.deleteAccount)
);

// Import default chart of accounts
router.post(
  '/import-default',
  authMiddleware,
  asyncHandler(AccountController.importDefaultChartOfAccounts)
);

// Import chart of accounts from CSV
import { upload } from '../controllers/account.controller';
router.post(
  '/import-csv',
  authMiddleware,
  upload.single('file'),
  asyncHandler(AccountController.importChartOfAccountsFromCsv)
);

export default router;
