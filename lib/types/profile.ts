// =============================================================================
// Benefits Profile Type Definitions
// Matches the database schema in supabase/profile-schema.sql
// =============================================================================

// Supported states for PoC
export type SupportedState = 'CA' | 'TX' | 'NY';

// Citizenship status options
export type CitizenshipStatus = 'citizen' | 'permanent_resident' | 'qualified_immigrant' | 'other';

// Employment status options
export type EmploymentStatus = 'employed' | 'unemployed' | 'self_employed' | 'retired' | 'disabled' | 'student';

// =============================================================================
// HOUSEHOLD
// =============================================================================

export type HouseholdRelationship =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other_relative'
  | 'unrelated';

export interface HouseholdMember {
  name: string;
  age: number;
  relationship: HouseholdRelationship;
  isDisabled?: boolean;
  isElderly?: boolean; // 60+ for SNAP purposes
}

// =============================================================================
// USER PROFILE
// =============================================================================

export interface UserProfile {
  id: string;
  user_id: string;

  // Personal Information
  full_name: string | null;
  date_of_birth: string | null; // ISO date string
  phone_number: string | null;

  // Household Information
  household_size: number;
  household_composition: HouseholdMember[];

  // Address Information
  street_address: string | null;
  city: string | null;
  state: SupportedState | null;
  zip_code: string | null;
  county: string | null;

  // Status Information
  citizenship_status: CitizenshipStatus | null;
  employment_status: EmploymentStatus | null;

  // Metadata
  profile_completeness: number; // 0-100
  onboarding_completed: boolean;
  onboarding_step: number; // 1-8

  // Timestamps
  created_at: string;
  updated_at: string;
}

// For creating/updating profiles (without server-generated fields)
export interface UserProfileInput {
  full_name?: string | null;
  date_of_birth?: string | null;
  phone_number?: string | null;
  household_size?: number;
  household_composition?: HouseholdMember[];
  street_address?: string | null;
  city?: string | null;
  state?: SupportedState | null;
  zip_code?: string | null;
  county?: string | null;
  citizenship_status?: CitizenshipStatus | null;
  employment_status?: EmploymentStatus | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

// =============================================================================
// INCOME SOURCES
// =============================================================================

export type IncomeType =
  | 'w2_employment'
  | 'self_employment'
  | 'gig_work'
  | 'freelance'
  | 'seasonal'
  | 'tips'
  | 'commission'
  | 'social_security'
  | 'ssi'
  | 'ssdi'
  | 'unemployment'
  | 'child_support'
  | 'alimony'
  | 'pension'
  | 'rental_income'
  | 'investment_income'
  | 'other';

export type IncomeFrequency =
  | 'hourly'
  | 'weekly'
  | 'biweekly'
  | 'semi_monthly'
  | 'monthly'
  | 'annual'
  | 'irregular';

export interface IrregularMonth {
  month: string; // YYYY-MM format
  amount: number;
}

export interface IncomeSource {
  id: string;
  user_id: string;

  // Income Type
  income_type: IncomeType;

  // Income Details
  source_name: string;
  amount: number;
  frequency: IncomeFrequency;
  hours_per_week: number | null;

  // Calculated Monthly Amount
  monthly_amount: number | null;

  // Irregular Income Tracking
  is_irregular: boolean;
  irregular_months: IrregularMonth[] | null;
  calculated_monthly_average: number | null;

  // Self-Employment Specific
  business_expenses: number;

  // Verification
  verified: boolean;
  verification_document_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// For creating/updating income sources
export interface IncomeSourceInput {
  income_type: IncomeType;
  source_name: string;
  amount: number;
  frequency: IncomeFrequency;
  hours_per_week?: number | null;
  is_irregular?: boolean;
  irregular_months?: IrregularMonth[] | null;
  calculated_monthly_average?: number | null;
  business_expenses?: number;
  verified?: boolean;
  verification_document_id?: string | null;
}

// =============================================================================
// EXPENSES
// =============================================================================

export type ExpenseType =
  | 'rent'
  | 'mortgage'
  | 'property_tax'
  | 'homeowners_insurance'
  | 'utilities_electric'
  | 'utilities_gas'
  | 'utilities_water'
  | 'utilities_phone'
  | 'utilities_internet'
  | 'child_care'
  | 'child_support_paid'
  | 'medical_out_of_pocket'
  | 'medical_insurance_premium'
  | 'dependent_care'
  | 'other';

export type ExpenseFrequency =
  | 'weekly'
  | 'biweekly'
  | 'semi_monthly'
  | 'monthly'
  | 'quarterly'
  | 'annual';

export interface Expense {
  id: string;
  user_id: string;

  // Expense Type
  expense_type: ExpenseType;

  // Expense Details
  description: string | null;
  amount: number;
  frequency: ExpenseFrequency;

  // Calculated Monthly Amount
  monthly_amount: number;

  // Verification
  verified: boolean;
  verification_document_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// For creating/updating expenses
export interface ExpenseInput {
  expense_type: ExpenseType;
  description?: string | null;
  amount: number;
  frequency: ExpenseFrequency;
  verified?: boolean;
  verification_document_id?: string | null;
}

// =============================================================================
// ASSETS
// =============================================================================

export type AssetType =
  | 'checking_account'
  | 'savings_account'
  | 'cash'
  | 'stocks'
  | 'bonds'
  | 'retirement_401k'
  | 'retirement_ira'
  | 'vehicle_primary'
  | 'vehicle_additional'
  | 'property_primary_home'
  | 'property_other'
  | 'life_insurance_cash_value'
  | 'other';

export interface Asset {
  id: string;
  user_id: string;

  // Asset Type
  asset_type: AssetType;

  // Asset Details
  description: string | null;
  current_value: number;

  // Exemption Status
  is_exempt: boolean;
  exemption_reason: string | null;

  // Verification
  verified: boolean;
  verification_document_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// For creating/updating assets
export interface AssetInput {
  asset_type: AssetType;
  description?: string | null;
  current_value: number;
  is_exempt?: boolean;
  exemption_reason?: string | null;
  verified?: boolean;
  verification_document_id?: string | null;
}

// =============================================================================
// DOCUMENTS
// =============================================================================

export type DocumentType =
  | 'paystub'
  | 'w2'
  | '1099'
  | 'tax_return'
  | 'bank_statement'
  | 'id_drivers_license'
  | 'id_state_id'
  | 'id_passport'
  | 'social_security_card'
  | 'utility_bill'
  | 'rent_receipt'
  | 'lease_agreement'
  | 'medical_bill'
  | 'other';

export type DocumentMimeType = 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/jpg';

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Extracted data structures by document type
export interface PaystubExtractedData {
  employer_name?: string;
  pay_period_start?: string;
  pay_period_end?: string;
  gross_pay?: number;
  net_pay?: number;
  year_to_date_gross?: number;
  hours_worked?: number;
  hourly_rate?: number;
  deductions?: Array<{ name: string; amount: number }>;
}

export interface UtilityBillExtractedData {
  service_provider?: string;
  service_type?: string;
  account_number?: string;
  billing_period_start?: string;
  billing_period_end?: string;
  amount_due?: number;
  due_date?: string;
}

export interface IdDocumentExtractedData {
  full_name?: string;
  date_of_birth?: string;
  id_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  expiration_date?: string;
}

export interface BankStatementExtractedData {
  bank_name?: string;
  account_type?: string;
  account_number_last4?: string;
  statement_period_start?: string;
  statement_period_end?: string;
  beginning_balance?: number;
  ending_balance?: number;
}

export type ExtractedData =
  | PaystubExtractedData
  | UtilityBillExtractedData
  | IdDocumentExtractedData
  | BankStatementExtractedData
  | Record<string, unknown>;

export interface Document {
  id: string;
  user_id: string;

  // File Information
  file_name: string;
  file_size: number;
  mime_type: DocumentMimeType;
  storage_path: string;

  // Document Type
  document_type: DocumentType;

  // Extraction Status
  extraction_status: ExtractionStatus;
  extracted_data: ExtractedData | null;
  extraction_confidence: number | null; // 0-1
  extraction_error: string | null;

  // Linked Records
  linked_income_source_id: string | null;
  linked_expense_id: string | null;
  linked_asset_id: string | null;

  // User Verification
  user_verified: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// For creating documents
export interface DocumentInput {
  file_name: string;
  file_size: number;
  mime_type: DocumentMimeType;
  storage_path: string;
  document_type: DocumentType;
}

// =============================================================================
// ELIGIBILITY SNAPSHOTS
// =============================================================================

export interface CalculationDetails {
  // FPL thresholds used
  fpl_monthly: number;
  gross_income_limit: number; // 130% FPL
  net_income_limit: number; // 100% FPL
  asset_limit: number;

  // Income breakdown
  income_sources: Array<{
    source_name: string;
    monthly_amount: number;
  }>;

  // Deductions applied
  standard_deduction: number;
  earned_income_deduction: number;
  shelter_deduction: number;
  dependent_care_deduction: number;
  medical_deduction: number;

  // Net income calculation
  gross_income: number;
  total_deductions: number;
  net_income: number;
}

export interface StateSpecificData {
  state: SupportedState;
  program_name: string;
  income_limit: number;
  asset_limit: number;
  special_rules?: string[];
}

export interface EligibilitySnapshot {
  id: string;
  user_id: string;

  // Income Summary
  total_gross_monthly_income: number;
  total_net_monthly_income: number;
  total_monthly_expenses: number;
  total_assets: number;
  total_countable_assets: number;

  // Household Info
  household_size: number;
  state: SupportedState;

  // SNAP Eligibility
  snap_eligible: boolean | null;
  snap_gross_income_test: boolean | null;
  snap_net_income_test: boolean | null;
  snap_asset_test: boolean | null;
  snap_estimated_benefit: number | null;

  // Medicaid Eligibility
  medicaid_eligible: boolean | null;
  medicaid_income_test: boolean | null;
  medicaid_asset_test: boolean | null;
  medicaid_category: string | null;

  // Calculation Details
  calculation_details: CalculationDetails;
  state_specific_data: StateSpecificData | null;

  // Timestamps
  calculated_at: string;
  expires_at: string;
}

// =============================================================================
// COMPOSITE TYPES (for API responses)
// =============================================================================

// Complete user profile with all related data
export interface CompleteUserProfile {
  profile: UserProfile;
  income_sources: IncomeSource[];
  expenses: Expense[];
  assets: Asset[];
  documents: Document[];
  latest_eligibility: EligibilitySnapshot | null;
}

// Summary for chat context injection
export interface ProfileSummary {
  // Personal
  state: SupportedState | null;
  household_size: number;
  household_has_elderly: boolean;
  household_has_disabled: boolean;

  // Income
  total_gross_monthly_income: number;
  income_sources_count: number;
  has_irregular_income: boolean;

  // Expenses
  total_monthly_expenses: number;
  shelter_expenses: number;

  // Assets
  total_assets: number;
  countable_assets: number;

  // Eligibility
  snap_status: 'likely_eligible' | 'likely_ineligible' | 'unknown';
  snap_estimated_benefit: number | null;
  medicaid_status: 'likely_eligible' | 'likely_ineligible' | 'unknown';

  // Meta
  profile_completeness: number;
  last_calculated: string | null;
}

// =============================================================================
// HELPER TYPE UTILITIES
// =============================================================================

// Make all properties optional for partial updates
export type PartialUserProfile = Partial<UserProfileInput>;
export type PartialIncomeSource = Partial<IncomeSourceInput>;
export type PartialExpense = Partial<ExpenseInput>;
export type PartialAsset = Partial<AssetInput>;

// API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Pagination for lists
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
