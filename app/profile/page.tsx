'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CompleteUserProfile, IncomeSource, Expense, Asset, SupportedState } from '@/lib/types/profile';
import Link from 'next/link';

// Format currency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// Income type display names
const incomeTypeLabels: Record<string, string> = {
  w2_employment: 'W-2 Employment',
  self_employment: 'Self-Employment',
  gig_work: 'Gig Work',
  freelance: 'Freelance',
  seasonal: 'Seasonal Work',
  tips: 'Tips',
  commission: 'Commission',
  social_security: 'Social Security',
  ssi: 'SSI',
  ssdi: 'SSDI',
  unemployment: 'Unemployment',
  child_support: 'Child Support',
  alimony: 'Alimony',
  pension: 'Pension',
  rental_income: 'Rental Income',
  investment_income: 'Investment Income',
  other: 'Other',
};

// Expense type display names
const expenseTypeLabels: Record<string, string> = {
  rent: 'Rent',
  mortgage: 'Mortgage',
  property_tax: 'Property Tax',
  homeowners_insurance: "Homeowner's Insurance",
  utilities_electric: 'Electric',
  utilities_gas: 'Gas',
  utilities_water: 'Water',
  utilities_phone: 'Phone',
  utilities_internet: 'Internet',
  child_care: 'Child Care',
  child_support_paid: 'Child Support Paid',
  medical_out_of_pocket: 'Medical (Out of Pocket)',
  medical_insurance_premium: 'Medical Insurance Premium',
  dependent_care: 'Dependent Care',
  other: 'Other',
};

// Asset type display names
const assetTypeLabels: Record<string, string> = {
  checking_account: 'Checking Account',
  savings_account: 'Savings Account',
  cash: 'Cash',
  stocks: 'Stocks',
  bonds: 'Bonds',
  retirement_401k: '401(k)',
  retirement_ira: 'IRA',
  vehicle_primary: 'Primary Vehicle',
  vehicle_additional: 'Additional Vehicle',
  property_primary_home: 'Primary Home',
  property_other: 'Other Property',
  life_insurance_cash_value: 'Life Insurance (Cash Value)',
  other: 'Other',
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for personal info
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    full_name: '',
    state: '' as SupportedState | '',
    household_size: 1,
  });

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load profile');
      }
      const data: CompleteUserProfile = await response.json();
      setProfile(data);
      setPersonalForm({
        full_name: data.profile.full_name || '',
        state: data.profile.state || '',
        household_size: data.profile.household_size || 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check auth first
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      loadProfile();
    };
    checkAuth();
  }, [supabase.auth, router, loadProfile]);

  const savePersonalInfo = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalForm),
      });
      if (!response.ok) throw new Error('Failed to save');
      await loadProfile();
      setEditingPersonal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteIncomeSource = async (id: string) => {
    if (!confirm('Delete this income source?')) return;
    try {
      const response = await fetch(`/api/profile/income/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const response = await fetch(`/api/profile/expenses/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    try {
      const response = await fetch(`/api/profile/assets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Calculate totals
  const totalMonthlyIncome = profile?.income_sources.reduce(
    (sum, inc) => sum + (inc.monthly_amount || 0),
    0
  ) || 0;

  const totalMonthlyExpenses = profile?.expenses.reduce(
    (sum, exp) => sum + exp.monthly_amount,
    0
  ) || 0;

  const totalAssets = profile?.assets.reduce(
    (sum, asset) => sum + asset.current_value,
    0
  ) || 0;

  const countableAssets = profile?.assets
    .filter((a) => !a.is_exempt)
    .reduce((sum, a) => sum + a.current_value, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-semibold text-gray-900">Your Profile</h1>
          </div>
          <div className="text-sm text-gray-500">
            {profile?.profile.profile_completeness || 0}% complete
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm text-gray-500">{profile?.profile.profile_completeness || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${profile?.profile.profile_completeness || 0}%` }}
            />
          </div>
        </div>

        {/* Personal Information */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
            {!editingPersonal && (
              <button
                onClick={() => setEditingPersonal(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>
          <div className="p-4">
            {editingPersonal ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={personalForm.full_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={personalForm.state}
                    onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value as SupportedState })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select state</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="NY">New York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Household Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={personalForm.household_size}
                    onChange={(e) => setPersonalForm({ ...personalForm, household_size: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={savePersonalInfo}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingPersonal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="font-medium">{profile?.profile.full_name || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">State</dt>
                  <dd className="font-medium">{profile?.profile.state || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Household Size</dt>
                  <dd className="font-medium">{profile?.profile.household_size || 1}</dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        {/* Income Sources */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Income Sources</h2>
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(totalMonthlyIncome)}/month
              </p>
            </div>
            <Link
              href="/profile/income/new"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Income
            </Link>
          </div>
          <div className="divide-y">
            {profile?.income_sources.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No income sources added yet
              </div>
            ) : (
              profile?.income_sources.map((income: IncomeSource) => (
                <div key={income.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{income.source_name}</p>
                    <p className="text-sm text-gray-500">
                      {incomeTypeLabels[income.income_type] || income.income_type}
                      {income.is_irregular && ' (Irregular)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(income.monthly_amount || 0)}/mo
                    </span>
                    <button
                      onClick={() => deleteIncomeSource(income.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Expenses */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Monthly Expenses</h2>
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(totalMonthlyExpenses)}/month
              </p>
            </div>
            <Link
              href="/profile/expenses/new"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Expense
            </Link>
          </div>
          <div className="divide-y">
            {profile?.expenses.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No expenses added yet
              </div>
            ) : (
              profile?.expenses.map((expense: Expense) => (
                <div key={expense.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {expenseTypeLabels[expense.expense_type] || expense.expense_type}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-gray-500">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(expense.monthly_amount)}/mo
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Assets */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Assets</h2>
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(totalAssets)} (Countable: {formatCurrency(countableAssets)})
              </p>
            </div>
            <Link
              href="/profile/assets/new"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Asset
            </Link>
          </div>
          <div className="divide-y">
            {profile?.assets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No assets added yet
              </div>
            ) : (
              profile?.assets.map((asset: Asset) => (
                <div key={asset.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {assetTypeLabels[asset.asset_type] || asset.asset_type}
                      {asset.is_exempt && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Exempt
                        </span>
                      )}
                    </p>
                    {asset.description && (
                      <p className="text-sm text-gray-500">{asset.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(asset.current_value)}</span>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
