export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface EligibilityRules {
  state: string;
  program: string;
  incomeLimit: {
    householdSize: number;
    monthly: number;
    annual: number;
  }[];
  assetLimit?: number;
  requirements: string[];
  lastUpdated: string;
}

export interface DocumentAnalysis {
  documentType: 'paystub' | 'id' | 'bill' | 'unknown';
  extractedData: Record<string, string | number>;
  confidence: number;
}
