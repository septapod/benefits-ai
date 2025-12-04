import { SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  UserProfileInput,
  IncomeSource,
  IncomeSourceInput,
  Expense,
  ExpenseInput,
  Asset,
  AssetInput,
  Document,
  DocumentInput,
  EligibilitySnapshot,
  CompleteUserProfile,
  ProfileSummary,
  ApiResponse,
} from '@/lib/types/profile';

// =============================================================================
// USER PROFILE CRUD
// =============================================================================

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (not an error for our case)
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UserProfileInput = {}
): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UserProfileInput
): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getOrCreateUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<UserProfile>> {
  // Try to get existing profile
  const existing = await getUserProfile(supabase, userId);
  if (existing.data) {
    return existing;
  }

  // Create new profile if doesn't exist
  return createUserProfile(supabase, userId);
}

// =============================================================================
// INCOME SOURCES CRUD
// =============================================================================

export async function getIncomeSources(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<IncomeSource[]>> {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getIncomeSource(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<IncomeSource>> {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createIncomeSource(
  supabase: SupabaseClient,
  userId: string,
  input: IncomeSourceInput
): Promise<ApiResponse<IncomeSource>> {
  const { data, error } = await supabase
    .from('income_sources')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateIncomeSource(
  supabase: SupabaseClient,
  id: string,
  input: Partial<IncomeSourceInput>
): Promise<ApiResponse<IncomeSource>> {
  const { data, error } = await supabase
    .from('income_sources')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteIncomeSource(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

// =============================================================================
// EXPENSES CRUD
// =============================================================================

export async function getExpenses(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<Expense[]>> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getExpense(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<Expense>> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createExpense(
  supabase: SupabaseClient,
  userId: string,
  input: ExpenseInput
): Promise<ApiResponse<Expense>> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateExpense(
  supabase: SupabaseClient,
  id: string,
  input: Partial<ExpenseInput>
): Promise<ApiResponse<Expense>> {
  const { data, error } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteExpense(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

// =============================================================================
// ASSETS CRUD
// =============================================================================

export async function getAssets(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<Asset[]>> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getAsset(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<Asset>> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createAsset(
  supabase: SupabaseClient,
  userId: string,
  input: AssetInput
): Promise<ApiResponse<Asset>> {
  const { data, error } = await supabase
    .from('assets')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateAsset(
  supabase: SupabaseClient,
  id: string,
  input: Partial<AssetInput>
): Promise<ApiResponse<Asset>> {
  const { data, error } = await supabase
    .from('assets')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteAsset(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

// =============================================================================
// DOCUMENTS CRUD
// =============================================================================

export async function getDocuments(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<Document[]>> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getDocument(
  supabase: SupabaseClient,
  id: string
): Promise<ApiResponse<Document>> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function createDocument(
  supabase: SupabaseClient,
  userId: string,
  input: DocumentInput
): Promise<ApiResponse<Document>> {
  const { data, error } = await supabase
    .from('documents')
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateDocumentExtraction(
  supabase: SupabaseClient,
  id: string,
  extractionData: {
    extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
    extracted_data?: Record<string, unknown> | null;
    extraction_confidence?: number | null;
    extraction_error?: string | null;
  }
): Promise<ApiResponse<Document>> {
  const { data, error } = await supabase
    .from('documents')
    .update(extractionData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function verifyDocument(
  supabase: SupabaseClient,
  id: string,
  linkedRecordId?: { income?: string; expense?: string; asset?: string }
): Promise<ApiResponse<Document>> {
  const updateData: Record<string, unknown> = { user_verified: true };

  if (linkedRecordId?.income) {
    updateData.linked_income_source_id = linkedRecordId.income;
  }
  if (linkedRecordId?.expense) {
    updateData.linked_expense_id = linkedRecordId.expense;
  }
  if (linkedRecordId?.asset) {
    updateData.linked_asset_id = linkedRecordId.asset;
  }

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteDocument(
  supabase: SupabaseClient,
  id: string,
  storagePath: string
): Promise<ApiResponse<null>> {
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('user-documents')
    .remove([storagePath]);

  if (storageError) {
    return { data: null, error: `Storage error: ${storageError.message}` };
  }

  // Then delete the database record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

// =============================================================================
// ELIGIBILITY SNAPSHOTS
// =============================================================================

export async function getLatestEligibilitySnapshot(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<EligibilitySnapshot>> {
  const { data, error } = await supabase
    .from('eligibility_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getEligibilityHistory(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<ApiResponse<EligibilitySnapshot[]>> {
  const { data, error } = await supabase
    .from('eligibility_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data || [], error: null };
}

export async function createEligibilitySnapshot(
  supabase: SupabaseClient,
  userId: string,
  snapshot: Omit<EligibilitySnapshot, 'id' | 'user_id' | 'calculated_at' | 'expires_at'>
): Promise<ApiResponse<EligibilitySnapshot>> {
  const { data, error } = await supabase
    .from('eligibility_snapshots')
    .insert({ user_id: userId, ...snapshot })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// =============================================================================
// COMPOSITE DATA FETCHING
// =============================================================================

export async function getCompleteUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<CompleteUserProfile>> {
  // Fetch all data in parallel
  const [
    profileResult,
    incomeResult,
    expensesResult,
    assetsResult,
    documentsResult,
    eligibilityResult,
  ] = await Promise.all([
    getUserProfile(supabase, userId),
    getIncomeSources(supabase, userId),
    getExpenses(supabase, userId),
    getAssets(supabase, userId),
    getDocuments(supabase, userId),
    getLatestEligibilitySnapshot(supabase, userId),
  ]);

  // Check for critical errors
  if (profileResult.error && profileResult.error !== 'null') {
    return { data: null, error: profileResult.error };
  }

  // If no profile exists, create one
  let profile = profileResult.data;
  if (!profile) {
    const createResult = await createUserProfile(supabase, userId);
    if (createResult.error) {
      return { data: null, error: createResult.error };
    }
    profile = createResult.data!;
  }

  return {
    data: {
      profile,
      income_sources: incomeResult.data || [],
      expenses: expensesResult.data || [],
      assets: assetsResult.data || [],
      documents: documentsResult.data || [],
      latest_eligibility: eligibilityResult.data,
    },
    error: null,
  };
}

// =============================================================================
// PROFILE SUMMARY (for chat context)
// =============================================================================

export async function getProfileSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<ProfileSummary>> {
  const completeProfile = await getCompleteUserProfile(supabase, userId);

  if (completeProfile.error || !completeProfile.data) {
    return { data: null, error: completeProfile.error };
  }

  const { profile, income_sources, expenses, assets, latest_eligibility } = completeProfile.data;

  // Calculate totals
  const totalGrossMonthlyIncome = income_sources.reduce(
    (sum, inc) => sum + (inc.monthly_amount || 0),
    0
  );

  const totalMonthlyExpenses = expenses.reduce(
    (sum, exp) => sum + exp.monthly_amount,
    0
  );

  const shelterExpenses = expenses
    .filter((e) => ['rent', 'mortgage', 'property_tax', 'homeowners_insurance'].includes(e.expense_type))
    .reduce((sum, e) => sum + e.monthly_amount, 0);

  const totalAssets = assets.reduce((sum, a) => sum + a.current_value, 0);
  const countableAssets = assets
    .filter((a) => !a.is_exempt)
    .reduce((sum, a) => sum + a.current_value, 0);

  const hasIrregularIncome = income_sources.some((inc) => inc.is_irregular);

  // Check household composition for elderly/disabled
  const householdHasElderly = profile.household_composition.some(
    (m) => m.isElderly || m.age >= 60
  );
  const householdHasDisabled = profile.household_composition.some(
    (m) => m.isDisabled
  );

  // Determine eligibility status
  let snapStatus: 'likely_eligible' | 'likely_ineligible' | 'unknown' = 'unknown';
  let medicaidStatus: 'likely_eligible' | 'likely_ineligible' | 'unknown' = 'unknown';

  if (latest_eligibility) {
    snapStatus = latest_eligibility.snap_eligible
      ? 'likely_eligible'
      : latest_eligibility.snap_eligible === false
      ? 'likely_ineligible'
      : 'unknown';

    medicaidStatus = latest_eligibility.medicaid_eligible
      ? 'likely_eligible'
      : latest_eligibility.medicaid_eligible === false
      ? 'likely_ineligible'
      : 'unknown';
  }

  return {
    data: {
      state: profile.state,
      household_size: profile.household_size,
      household_has_elderly: householdHasElderly,
      household_has_disabled: householdHasDisabled,
      total_gross_monthly_income: totalGrossMonthlyIncome,
      income_sources_count: income_sources.length,
      has_irregular_income: hasIrregularIncome,
      total_monthly_expenses: totalMonthlyExpenses,
      shelter_expenses: shelterExpenses,
      total_assets: totalAssets,
      countable_assets: countableAssets,
      snap_status: snapStatus,
      snap_estimated_benefit: latest_eligibility?.snap_estimated_benefit || null,
      medicaid_status: medicaidStatus,
      profile_completeness: profile.profile_completeness,
      last_calculated: latest_eligibility?.calculated_at || null,
    },
    error: null,
  };
}

// =============================================================================
// ONBOARDING HELPERS
// =============================================================================

export async function updateOnboardingStep(
  supabase: SupabaseClient,
  userId: string,
  step: number,
  completed = false
): Promise<ApiResponse<UserProfile>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      onboarding_step: step,
      onboarding_completed: completed,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getOnboardingStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<ApiResponse<{ step: number; completed: boolean; completeness: number }>> {
  const profile = await getUserProfile(supabase, userId);

  if (profile.error || !profile.data) {
    // No profile yet - user hasn't started onboarding
    return {
      data: { step: 1, completed: false, completeness: 0 },
      error: null,
    };
  }

  return {
    data: {
      step: profile.data.onboarding_step,
      completed: profile.data.onboarding_completed,
      completeness: profile.data.profile_completeness,
    },
    error: null,
  };
}
