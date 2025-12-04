'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IncomeType, IncomeFrequency } from '@/lib/types/profile';

const incomeTypes: { value: IncomeType; label: string }[] = [
  { value: 'w2_employment', label: 'W-2 Employment' },
  { value: 'self_employment', label: 'Self-Employment' },
  { value: 'gig_work', label: 'Gig Work (Uber, DoorDash, etc.)' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'seasonal', label: 'Seasonal Work' },
  { value: 'tips', label: 'Tips' },
  { value: 'commission', label: 'Commission' },
  { value: 'social_security', label: 'Social Security' },
  { value: 'ssi', label: 'SSI (Supplemental Security Income)' },
  { value: 'ssdi', label: 'SSDI (Social Security Disability)' },
  { value: 'unemployment', label: 'Unemployment Benefits' },
  { value: 'child_support', label: 'Child Support Received' },
  { value: 'alimony', label: 'Alimony Received' },
  { value: 'pension', label: 'Pension' },
  { value: 'rental_income', label: 'Rental Income' },
  { value: 'investment_income', label: 'Investment Income' },
  { value: 'other', label: 'Other' },
];

const frequencies: { value: IncomeFrequency; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every Two Weeks' },
  { value: 'semi_monthly', label: 'Twice a Month' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'irregular', label: 'Irregular/Varies' },
];

export default function NewIncomePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    income_type: '' as IncomeType | '',
    source_name: '',
    amount: '',
    frequency: '' as IncomeFrequency | '',
    hours_per_week: '',
    is_irregular: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.income_type || !form.source_name || !form.amount || !form.frequency) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income_type: form.income_type,
          source_name: form.source_name,
          amount: parseFloat(form.amount),
          frequency: form.frequency,
          hours_per_week: form.hours_per_week ? parseFloat(form.hours_per_week) : null,
          is_irregular: form.is_irregular,
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
          <h1 className="font-semibold text-gray-900">Add Income Source</h1>
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
              Income Type *
            </label>
            <select
              value={form.income_type}
              onChange={(e) => setForm({ ...form, income_type: e.target.value as IncomeType })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select type...</option>
              {incomeTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Name *
            </label>
            <input
              type="text"
              value={form.source_name}
              onChange={(e) => setForm({ ...form, source_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Target, Uber, Social Security Administration"
              required
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
                onChange={(e) => setForm({ ...form, frequency: e.target.value as IncomeFrequency })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select...</option>
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.frequency === 'hourly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours Per Week
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="168"
                value={form.hours_per_week}
                onChange={(e) => setForm({ ...form, hours_per_week: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 40"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="irregular"
              checked={form.is_irregular}
              onChange={(e) => setForm({ ...form, is_irregular: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="irregular" className="text-sm text-gray-700">
              This income varies month to month
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add Income Source'}
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
