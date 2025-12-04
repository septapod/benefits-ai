-- Benefits Profile System Schema
-- Run this in Supabase SQL Editor after the existing schema.sql and admin-schema.sql

-- =============================================================================
-- USER PROFILES - Extended profile information
-- =============================================================================
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,

  -- Personal Information
  full_name text,
  date_of_birth date,
  phone_number text,

  -- Household Information
  household_size integer default 1 check (household_size >= 1 and household_size <= 20),
  household_composition jsonb default '[]'::jsonb,
  -- Example: [{"name": "John", "age": 35, "relationship": "self"}, {"name": "Jane", "age": 32, "relationship": "spouse"}]

  -- Address Information
  street_address text,
  city text,
  state text check (state in ('CA', 'TX', 'NY')), -- Limited to supported states for PoC
  zip_code text,
  county text,

  -- Status Information
  citizenship_status text check (citizenship_status in ('citizen', 'permanent_resident', 'qualified_immigrant', 'other', null)),
  employment_status text check (employment_status in ('employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student', null)),

  -- Metadata
  profile_completeness integer default 0 check (profile_completeness >= 0 and profile_completeness <= 100),
  onboarding_completed boolean default false,
  onboarding_step integer default 1 check (onboarding_step >= 1 and onboarding_step <= 8),

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================================================
-- INCOME SOURCES - Multiple income streams per user
-- =============================================================================
create table if not exists income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Income Type
  income_type text not null check (income_type in (
    'w2_employment',
    'self_employment',
    'gig_work',
    'freelance',
    'seasonal',
    'tips',
    'commission',
    'social_security',
    'ssi',
    'ssdi',
    'unemployment',
    'child_support',
    'alimony',
    'pension',
    'rental_income',
    'investment_income',
    'other'
  )),

  -- Income Details
  source_name text not null, -- e.g., "Target", "Uber", "Social Security"
  amount numeric(10,2) not null check (amount >= 0),
  frequency text not null check (frequency in ('hourly', 'weekly', 'biweekly', 'semi_monthly', 'monthly', 'annual', 'irregular')),
  hours_per_week numeric(4,1) check (hours_per_week >= 0 and hours_per_week <= 168), -- For hourly workers

  -- Calculated Monthly Amount
  monthly_amount numeric(10,2), -- Auto-calculated or manually set

  -- Irregular Income Tracking
  is_irregular boolean default false,
  irregular_months jsonb default null,
  -- Example: [{"month": "2024-01", "amount": 2000}, {"month": "2024-02", "amount": 1500}]
  calculated_monthly_average numeric(10,2),

  -- Self-Employment Specific
  business_expenses numeric(10,2) default 0, -- For self-employment net income calculation

  -- Verification
  verified boolean default false,
  verification_document_id uuid, -- References documents table

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================================================
-- EXPENSES - Deductible expenses for benefit calculations
-- =============================================================================
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Expense Type
  expense_type text not null check (expense_type in (
    'rent',
    'mortgage',
    'property_tax',
    'homeowners_insurance',
    'utilities_electric',
    'utilities_gas',
    'utilities_water',
    'utilities_phone',
    'utilities_internet',
    'child_care',
    'child_support_paid',
    'medical_out_of_pocket',
    'medical_insurance_premium',
    'dependent_care',
    'other'
  )),

  -- Expense Details
  description text,
  amount numeric(10,2) not null check (amount >= 0),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'semi_monthly', 'monthly', 'quarterly', 'annual')),

  -- Calculated Monthly Amount
  monthly_amount numeric(10,2) not null, -- Normalized to monthly

  -- Verification
  verified boolean default false,
  verification_document_id uuid, -- References documents table

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================================================
-- ASSETS - Countable and exempt assets
-- =============================================================================
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Asset Type
  asset_type text not null check (asset_type in (
    'checking_account',
    'savings_account',
    'cash',
    'stocks',
    'bonds',
    'retirement_401k',
    'retirement_ira',
    'vehicle_primary',
    'vehicle_additional',
    'property_primary_home',
    'property_other',
    'life_insurance_cash_value',
    'other'
  )),

  -- Asset Details
  description text, -- e.g., "Chase Checking", "2018 Honda Civic"
  current_value numeric(12,2) not null check (current_value >= 0),

  -- Exemption Status
  is_exempt boolean default false,
  exemption_reason text, -- e.g., "Primary residence", "Single vehicle exemption"

  -- Verification
  verified boolean default false,
  verification_document_id uuid, -- References documents table

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================================================
-- DOCUMENTS - Uploaded files and extracted data
-- =============================================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- File Information
  file_name text not null,
  file_size integer not null check (file_size > 0 and file_size <= 10485760), -- Max 10MB
  mime_type text not null check (mime_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/jpg')),
  storage_path text not null, -- Path in Supabase Storage

  -- Document Type
  document_type text not null check (document_type in (
    'paystub',
    'w2',
    '1099',
    'tax_return',
    'bank_statement',
    'id_drivers_license',
    'id_state_id',
    'id_passport',
    'social_security_card',
    'utility_bill',
    'rent_receipt',
    'lease_agreement',
    'medical_bill',
    'other'
  )),

  -- Extraction Status
  extraction_status text default 'pending' check (extraction_status in ('pending', 'processing', 'completed', 'failed')),
  extracted_data jsonb default null,
  -- Example for paystub: {"employer_name": "Target", "gross_pay": 800.00, "net_pay": 650.32, ...}
  extraction_confidence numeric(3,2) check (extraction_confidence >= 0 and extraction_confidence <= 1),
  extraction_error text, -- Error message if extraction failed

  -- Linked Records (documents can create/update these)
  linked_income_source_id uuid references income_sources(id) on delete set null,
  linked_expense_id uuid references expenses(id) on delete set null,
  linked_asset_id uuid references assets(id) on delete set null,

  -- User Verification
  user_verified boolean default false, -- User confirmed extracted data is correct

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================================================
-- ELIGIBILITY SNAPSHOTS - Point-in-time eligibility calculations
-- =============================================================================
create table if not exists eligibility_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Income Summary (at time of calculation)
  total_gross_monthly_income numeric(10,2) not null,
  total_net_monthly_income numeric(10,2) not null,
  total_monthly_expenses numeric(10,2) not null,
  total_assets numeric(12,2) not null,
  total_countable_assets numeric(12,2) not null,

  -- Household Info (at time of calculation)
  household_size integer not null,
  state text not null,

  -- SNAP Eligibility
  snap_eligible boolean,
  snap_gross_income_test boolean, -- Passed 130% FPL test
  snap_net_income_test boolean, -- Passed 100% FPL test
  snap_asset_test boolean, -- Passed asset test
  snap_estimated_benefit numeric(10,2),

  -- Medicaid Eligibility
  medicaid_eligible boolean,
  medicaid_income_test boolean,
  medicaid_asset_test boolean,
  medicaid_category text, -- e.g., "MAGI", "ABD", "Long-term care"

  -- Calculation Details
  calculation_details jsonb not null,
  -- Stores: FPL thresholds used, deductions applied, income breakdown, etc.

  state_specific_data jsonb,
  -- Stores any state-specific rules or calculations applied

  -- Timestamps
  calculated_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '30 days') -- Eligibility should be recalculated periodically
);

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
create index if not exists idx_user_profiles_user_id on user_profiles(user_id);
create index if not exists idx_income_sources_user_id on income_sources(user_id);
create index if not exists idx_expenses_user_id on expenses(user_id);
create index if not exists idx_assets_user_id on assets(user_id);
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_documents_extraction_status on documents(extraction_status);
create index if not exists idx_eligibility_snapshots_user_id on eligibility_snapshots(user_id);
create index if not exists idx_eligibility_snapshots_calculated_at on eligibility_snapshots(calculated_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table income_sources enable row level security;
alter table expenses enable row level security;
alter table assets enable row level security;
alter table documents enable row level security;
alter table eligibility_snapshots enable row level security;

-- USER_PROFILES policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on user_profiles for delete
  using (auth.uid() = user_id);

create policy "Admins can view all profiles"
  on user_profiles for select
  using (is_admin());

-- INCOME_SOURCES policies
create policy "Users can view own income sources"
  on income_sources for select
  using (auth.uid() = user_id);

create policy "Users can insert own income sources"
  on income_sources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own income sources"
  on income_sources for update
  using (auth.uid() = user_id);

create policy "Users can delete own income sources"
  on income_sources for delete
  using (auth.uid() = user_id);

create policy "Admins can view all income sources"
  on income_sources for select
  using (is_admin());

-- EXPENSES policies
create policy "Users can view own expenses"
  on expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expenses for delete
  using (auth.uid() = user_id);

create policy "Admins can view all expenses"
  on expenses for select
  using (is_admin());

-- ASSETS policies
create policy "Users can view own assets"
  on assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assets"
  on assets for update
  using (auth.uid() = user_id);

create policy "Users can delete own assets"
  on assets for delete
  using (auth.uid() = user_id);

create policy "Admins can view all assets"
  on assets for select
  using (is_admin());

-- DOCUMENTS policies
create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

create policy "Admins can view all documents"
  on documents for select
  using (is_admin());

-- ELIGIBILITY_SNAPSHOTS policies
create policy "Users can view own eligibility snapshots"
  on eligibility_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own eligibility snapshots"
  on eligibility_snapshots for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all eligibility snapshots"
  on eligibility_snapshots for select
  using (is_admin());

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to calculate monthly amount from various frequencies
create or replace function calculate_monthly_amount(
  amount numeric,
  frequency text,
  hours_per_week numeric default null
) returns numeric as $$
begin
  return case frequency
    when 'hourly' then amount * coalesce(hours_per_week, 40) * 4.33 -- Average weeks per month
    when 'weekly' then amount * 4.33
    when 'biweekly' then amount * 2.17 -- 26 pay periods / 12 months
    when 'semi_monthly' then amount * 2
    when 'monthly' then amount
    when 'quarterly' then amount / 3
    when 'annual' then amount / 12
    when 'irregular' then amount -- Assumes amount is already monthly average
    else amount
  end;
end;
$$ language plpgsql;

-- Function to calculate profile completeness
create or replace function calculate_profile_completeness(p_user_id uuid)
returns integer as $$
declare
  completeness integer := 0;
  profile_record record;
  has_income boolean;
  has_expenses boolean;
begin
  -- Get profile
  select * into profile_record from user_profiles where user_id = p_user_id;

  if profile_record is null then
    return 0;
  end if;

  -- Personal info (20 points)
  if profile_record.full_name is not null then completeness := completeness + 5; end if;
  if profile_record.date_of_birth is not null then completeness := completeness + 5; end if;
  if profile_record.phone_number is not null then completeness := completeness + 5; end if;
  if profile_record.citizenship_status is not null then completeness := completeness + 5; end if;

  -- Household info (15 points)
  if profile_record.household_size is not null then completeness := completeness + 10; end if;
  if jsonb_array_length(profile_record.household_composition) > 0 then completeness := completeness + 5; end if;

  -- Address (20 points)
  if profile_record.street_address is not null then completeness := completeness + 5; end if;
  if profile_record.city is not null then completeness := completeness + 5; end if;
  if profile_record.state is not null then completeness := completeness + 5; end if;
  if profile_record.zip_code is not null then completeness := completeness + 5; end if;

  -- Income (25 points)
  select exists(select 1 from income_sources where user_id = p_user_id) into has_income;
  if has_income then completeness := completeness + 25; end if;

  -- Expenses (20 points)
  select exists(select 1 from expenses where user_id = p_user_id) into has_expenses;
  if has_expenses then completeness := completeness + 20; end if;

  return completeness;
end;
$$ language plpgsql security definer;

-- Trigger to auto-update profile completeness
create or replace function update_profile_completeness()
returns trigger as $$
begin
  update user_profiles
  set
    profile_completeness = calculate_profile_completeness(new.user_id),
    updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for profile completeness updates
drop trigger if exists trigger_update_completeness_on_profile on user_profiles;
create trigger trigger_update_completeness_on_profile
  after insert or update on user_profiles
  for each row execute function update_profile_completeness();

drop trigger if exists trigger_update_completeness_on_income on income_sources;
create trigger trigger_update_completeness_on_income
  after insert or delete on income_sources
  for each row execute function update_profile_completeness();

drop trigger if exists trigger_update_completeness_on_expenses on expenses;
create trigger trigger_update_completeness_on_expenses
  after insert or delete on expenses
  for each row execute function update_profile_completeness();

-- Function to auto-calculate monthly_amount on income insert/update
create or replace function auto_calculate_income_monthly()
returns trigger as $$
begin
  -- Only calculate if not irregular (irregular uses calculated_monthly_average)
  if new.frequency != 'irregular' then
    new.monthly_amount := calculate_monthly_amount(new.amount, new.frequency, new.hours_per_week);
  else
    new.monthly_amount := coalesce(new.calculated_monthly_average, new.amount);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_auto_calc_income_monthly on income_sources;
create trigger trigger_auto_calc_income_monthly
  before insert or update on income_sources
  for each row execute function auto_calculate_income_monthly();

-- Function to auto-calculate monthly_amount on expense insert/update
create or replace function auto_calculate_expense_monthly()
returns trigger as $$
begin
  new.monthly_amount := calculate_monthly_amount(new.amount, new.frequency, null);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_auto_calc_expense_monthly on expenses;
create trigger trigger_auto_calc_expense_monthly
  before insert or update on expenses
  for each row execute function auto_calculate_expense_monthly();

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

-- Generic updated_at trigger function (may already exist)
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables
drop trigger if exists trigger_user_profiles_updated_at on user_profiles;
create trigger trigger_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

drop trigger if exists trigger_income_sources_updated_at on income_sources;
create trigger trigger_income_sources_updated_at
  before update on income_sources
  for each row execute function update_updated_at();

drop trigger if exists trigger_expenses_updated_at on expenses;
create trigger trigger_expenses_updated_at
  before update on expenses
  for each row execute function update_updated_at();

drop trigger if exists trigger_assets_updated_at on assets;
create trigger trigger_assets_updated_at
  before update on assets
  for each row execute function update_updated_at();

drop trigger if exists trigger_documents_updated_at on documents;
create trigger trigger_documents_updated_at
  before update on documents
  for each row execute function update_updated_at();
