
// Database schema and utility functions for UC Management
// This would be implemented with actual database (PostgreSQL/Neon/Supabase)

export interface FundingAgency {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialYear {
  id: string;
  year: string; // Format: YYYY-YYYY
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrincipalInvestigator {
  id: string;
  name: string;
  email?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UCEntry {
  id: string;
  fundingAgencyId: string;
  financialYearId: string;
  piId: string;
  projectCode: string;
  
  // File information
  ucFileName: string;
  ucFilePath: string;
  sanctionLetterFileName: string;
  sanctionLetterPath: string;
  
  // Tracking fields
  dateReceived?: Date;
  dateGiven?: Date;
  status: 'Pending' | 'Submitted' | 'Verified';
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Database queries would be implemented here
export class UCDatabase {
  // Funding Agencies
  static async createFundingAgency(name: string): Promise<FundingAgency> {
    // Implementation for creating funding agency
    throw new Error("Not implemented - requires database connection");
  }
  
  static async getFundingAgencies(): Promise<FundingAgency[]> {
    // Implementation for fetching funding agencies
    throw new Error("Not implemented - requires database connection");
  }
  
  // Financial Years
  static async createFinancialYear(year: string): Promise<FinancialYear> {
    // Implementation for creating financial year
    throw new Error("Not implemented - requires database connection");
  }
  
  static async getFinancialYears(): Promise<FinancialYear[]> {
    // Implementation for fetching financial years
    throw new Error("Not implemented - requires database connection");
  }
  
  // Principal Investigators
  static async createPI(name: string, email?: string, department?: string): Promise<PrincipalInvestigator> {
    // Implementation for creating PI
    throw new Error("Not implemented - requires database connection");
  }
  
  static async getPIs(): Promise<PrincipalInvestigator[]> {
    // Implementation for fetching PIs
    throw new Error("Not implemented - requires database connection");
  }
  
  // UC Entries
  static async createUCEntry(entry: Omit<UCEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<UCEntry> {
    // Implementation for creating UC entry
    throw new Error("Not implemented - requires database connection");
  }
  
  static async updateUCEntry(id: string, updates: Partial<UCEntry>): Promise<UCEntry> {
    // Implementation for updating UC entry
    throw new Error("Not implemented - requires database connection");
  }
  
  static async getUCEntries(filters?: {
    fundingAgencyId?: string;
    financialYearId?: string;
    piId?: string;
    status?: string;
  }): Promise<UCEntry[]> {
    // Implementation for fetching UC entries with filters
    throw new Error("Not implemented - requires database connection");
  }
  
  static async deleteUCEntry(id: string): Promise<void> {
    // Implementation for deleting UC entry
    throw new Error("Not implemented - requires database connection");
  }
}
