"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.accountValidationRules = {
    createAccount: [
        (0, express_validator_1.body)('code')
            .trim()
            .notEmpty().withMessage('Le code est requis')
            .isLength({ min: 1, max: 10 }).withMessage('Le code doit contenir entre 1 et 10 caractères')
            .matches(/^[0-9]+$/).withMessage('Le code ne doit contenir que des chiffres'),
        (0, express_validator_1.body)('label')
            .trim()
            .notEmpty().withMessage('Le libellé est requis')
            .isLength({ min: 2, max: 255 }).withMessage('Le libellé doit contenir entre 2 et 255 caractères'),
        (0, express_validator_1.body)('classe')
            .isInt({ min: 1, max: 7 }).withMessage('La classe doit être un nombre entre 1 et 7'),
        (0, express_validator_1.body)('type')
            .isIn(['debit', 'credit']).withMessage("Le type doit être 'debit' ou 'credit'"),
        (0, express_validator_1.body)('category')
            .optional()
            .isIn(['detail', 'collectif']).withMessage("La catégorie doit être 'detail' ou 'collectif'"),
        (0, express_validator_1.body)('parentCode')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 10 }).withMessage('Le code parent doit contenir entre 1 et 10 caractères')
    ],
    updateAccount: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage("L'ID du compte est requis")
            .isMongoId().withMessage('ID de compte invalide'),
        (0, express_validator_1.body)('label')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 }).withMessage('Le libellé doit contenir entre 2 et 255 caractères'),
        (0, express_validator_1.body)('isActive')
            .optional()
            .isBoolean().withMessage('Le statut doit être un booléen'),
        (0, express_validator_1.body)('category')
            .optional()
            .isIn(['detail', 'collectif']).withMessage("La catégorie doit être 'detail' ou 'collectif'")
    ],
    deleteAccount: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage("L'ID du compte est requis")
            .isMongoId().withMessage('ID de compte invalide')
    ],
    getAccount: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage("L'ID du compte est requis")
            .isMongoId().withMessage('ID de compte invalide')
    ]
};
exports.default = exports.accountValidationRules;
