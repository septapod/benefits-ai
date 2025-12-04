'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AssetType } from '@/lib/types/profile';

const assetTypes: { value: AssetType; label: string; typicallyExempt?: boolean }[] = [
  { value: 'checking_account', label: 'Checking Account' },
  { value: 'savings_account', label: 'Savings Account' },
  { value: 'cash', label: 'Cash on Hand' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'retirement_401k', label: '401(k)', typicallyExempt: true },
  { value: 'retirement_ira', label: 'IRA', typicallyExempt: true },
  { value: 'vehicle_primary', label: 'Primary Vehicle', typicallyExempt: true },
  { value: 'vehicle_additional', label: 'Additional Vehicle' },
  { value: 'property_primary_home', label: 'Primary Home', typicallyExempt: true },
  { value: 'property_other', label: 'Other Property' },
  { value: 'life_insurance_cash_value', label: 'Life Insurance (Cash Value)' },
  { value: 'other', label: 'Other' },
];

export default function NewAssetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    asset_type: '' as AssetType | '',
    description: '',
    current_value: '',
    is_exempt: false,
    exemption_reason: '',
  });

  // Auto-suggest exemption when selecting typically exempt asset types
  const handleAssetTypeChange = (value: AssetType) => {
    const selectedType = assetTypes.find((t) => t.value === value);
    setForm({
      ...form,
      asset_type: value,
      is_exempt: selectedType?.typicallyExempt || false,
      exemption_reason: selectedType?.typicallyExempt
        ? getDefaultExemptionReason(value)
        : '',
    });
  };

  const getDefaultExemptionReason = (type: AssetType): string => {
    switch (type) {
      case 'retirement_401k':
      case 'retirement_ira':
        return 'Retirement accounts are typically exempt';
      case 'vehicle_primary':
        return 'Primary vehicle exemption';
      case 'property_primary_home':
        return 'Primary residence exemption';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asset_type || !form.current_value) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_type: form.asset_type,
          description: form.description || null,
          current_value: parseFloat(form.current_value),
          is_exempt: form.is_exempt,
          exemption_reason: form.is_exempt ? form.exemption_reason : null,
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
          <h1 className="font-semibold text-gray-900">Add Asset</h1>
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
              Asset Type *
            </label>
            <select
              value={form.asset_type}
              onChange={(e) => handleAssetTypeChange(e.target.value as AssetType)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select type...</option>
              {assetTypes.map((type) => (
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
              placeholder="e.g., Chase Checking, 2018 Honda Civic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Value *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="exempt"
                checked={form.is_exempt}
                onChange={(e) => setForm({ ...form, is_exempt: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="exempt" className="text-sm text-gray-700">
                This asset is exempt from benefit calculations
              </label>
            </div>

            {form.is_exempt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exemption Reason
                </label>
                <input
                  type="text"
                  value={form.exemption_reason}
                  onChange={(e) => setForm({ ...form, exemption_reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Primary residence, Retirement account"
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> For SNAP, countable assets are generally limited to $3,000
              ($4,500 if someone in the household is 60+). Retirement accounts, primary
              vehicles, and primary homes are usually exempt.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add Asset'}
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
