"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Wrapper pour gérer les fonctions asynchrones dans Express
 * Permet d'utiliser des fonctions async/await sans try/catch explicite dans chaque route
 *
 * @param fn Fonction asynchrone à exécuter
 * @returns Fonction middleware compatible avec Express
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.asyncHandler;
