import { body, param } from 'express-validator';

export const accountValidationRules = {
  createAccount: [
    body('code')
      .trim()
      .notEmpty().withMessage('Le code est requis')
      .isLength({ min: 1, max: 10 }).withMessage('Le code doit contenir entre 1 et 10 caractères')
      .matches(/^[0-9]+$/).withMessage('Le code ne doit contenir que des chiffres'),
    body('label')
      .trim()
      .notEmpty().withMessage('Le libellé est requis')
      .isLength({ min: 2, max: 255 }).withMessage('Le libellé doit contenir entre 2 et 255 caractères'),
    body('classe')
      .isInt({ min: 1, max: 7 }).withMessage('La classe doit être un nombre entre 1 et 7'),
    body('type')
      .isIn(['debit', 'credit']).withMessage("Le type doit être 'debit' ou 'credit'"),
    body('category')
      .optional()
      .isIn(['detail', 'collectif']).withMessage("La catégorie doit être 'detail' ou 'collectif'"),
    body('parentCode')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 10 }).withMessage('Le code parent doit contenir entre 1 et 10 caractères')
  ],
  updateAccount: [
    param('id')
      .notEmpty().withMessage("L'ID du compte est requis")
      .isMongoId().withMessage('ID de compte invalide'),
    body('label')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Le libellé doit contenir entre 2 et 255 caractères'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('Le statut doit être un booléen'),
    body('category')
      .optional()
      .isIn(['detail', 'collectif']).withMessage("La catégorie doit être 'detail' ou 'collectif'")
  ],
  deleteAccount: [
    param('id')
      .notEmpty().withMessage("L'ID du compte est requis")
      .isMongoId().withMessage('ID de compte invalide')
  ],
  getAccount: [
    param('id')
      .notEmpty().withMessage("L'ID du compte est requis")
      .isMongoId().withMessage('ID de compte invalide')
  ]
};

export default accountValidationRules;
