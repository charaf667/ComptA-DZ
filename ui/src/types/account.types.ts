/**
 * Interface pour un compte du plan comptable
 */
export interface IAccount {
  _id: string;
  id: string;
  code: string;
  label: string;
  classe: number;
  type: 'debit' | 'credit';
  category: 'detail' | 'collectif';
  parentCode?: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  children?: IAccount[];
}

/**
 * Interface pour la création d'un compte
 */
export interface IAccountCreate {
  code: string;
  label: string;
  classe: number;
  type: 'debit' | 'credit';
  category?: 'detail' | 'collectif';
  parentCode?: string;
}

/**
 * Interface pour la mise à jour d'un compte
 */
export interface IAccountUpdate {
  label?: string;
  isActive?: boolean;
  category?: 'detail' | 'collectif';
}

/**
 * Type pour les classes du plan comptable (1-7)
 */
export type AccountClassNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Interface pour les filtres de recherche des comptes
 */
export interface IAccountFilters {
  classe?: number;
  isActive?: boolean;
  search?: string;
  parentCode?: string;
}
