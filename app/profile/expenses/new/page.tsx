'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExpenseType, ExpenseFrequency } from '@/lib/types/profile';

const expenseTypes: { value: ExpenseType; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'property_tax', label: 'Property Tax' },
  { value: 'homeowners_insurance', label: "Homeowner's Insurance" },
  { value: 'utilities_electric', label: 'Electric Bill' },
  { value: 'utilities_gas', label: 'Gas Bill' },
  { value: 'utilities_water', label: 'Water Bill' },
  { value: 'utilities_phone', label: 'Phone Bill' },
  { value: 'utilities_internet', label: 'Internet Bill' },
  { value: 'child_care', label: 'Child Care' },
  { value: 'child_support_paid', label: 'Child Support (Paid)' },
  { value: 'medical_out_of_pocket', label: 'Medical Expenses (Out of Pocket)' },
  { value: 'medical_insurance_premium', label: 'Medical Insurance Premium' },
  { value: 'dependent_care', label: 'Dependent Care' },
  { value: 'other', label: 'Other' },
];

const frequencies: { value: ExpenseFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every Two Weeks' },
  { value: 'semi_monthly', label: 'Twice a Month' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

export default function NewExpensePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    expense_type: '' as ExpenseType | '',
    description: '',
    amount: '',
    frequency: 'monthly' as ExpenseFrequency,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.expense_type || !form.amount || !form.frequency) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense_type: form.expense_type,
          description: form.description || null,
          amount: parseFloat(form.amount),
          frequency: form.frequency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-gray-900">Add Expense</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Type *
            </label>
            <select
              value={form.expense_type}
              onChange={(e) => setForm({ ...form, expense_type: e.target.value as ExpenseType })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select type...</option>
              {expenseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., PG&E, Landlord name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as ExpenseFrequency })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add Expense'}
            </button>
            <Link
              href="/profile"
              className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
