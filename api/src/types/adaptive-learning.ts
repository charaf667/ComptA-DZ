export interface LearningPattern {
  id: string;
  tenantId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  keywords: string[];
  confidence: number;
  usageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountSuggestion {
  id: string;
  code: string;
  name: string;
  confidence: number;
  source: 'pattern' | 'rule' | 'hybrid';
  matchedKeywords?: string[];
}

export interface PerformanceMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  modifiedSuggestions: number;
  averageConfidence: number;
  explanations: {
    [key: string]: {
      count: number;
      examples: string[];
    };
  };
}

export interface FeedbackResult {
  success: boolean;
  patternId?: string;
  message?: string;
}
