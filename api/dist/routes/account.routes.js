"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const account_validator_1 = __importDefault(require("../validators/account.validator"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Wrapper pour gérer les erreurs de type avec Express
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const router = (0, express_1.Router)();
// CRUD routes for accounts
router.post('/', authMiddleware_1.authMiddleware, account_validator_1.default.createAccount, asyncHandler(account_controller_1.AccountController.createAccount));
router.get('/', authMiddleware_1.authMiddleware, asyncHandler(account_controller_1.AccountController.getAccounts));
router.get('/:id', authMiddleware_1.authMiddleware, account_validator_1.default.getAccount, asyncHandler(account_controller_1.AccountController.getAccountById));
router.put('/:id', authMiddleware_1.authMiddleware, account_validator_1.default.updateAccount, asyncHandler(account_controller_1.AccountController.updateAccount));
router.delete('/:id', authMiddleware_1.authMiddleware, account_validator_1.default.deleteAccount, asyncHandler(account_controller_1.AccountController.deleteAccount));
// Import default chart of accounts
router.post('/import-default', authMiddleware_1.authMiddleware, asyncHandler(account_controller_1.AccountController.importDefaultChartOfAccounts));
// Import chart of accounts from CSV
const account_controller_2 = require("../controllers/account.controller");
router.post('/import-csv', authMiddleware_1.authMiddleware, account_controller_2.upload.single('file'), asyncHandler(account_controller_1.AccountController.importChartOfAccountsFromCsv));
exports.default = router;
