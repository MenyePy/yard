'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const PRODUCT_TYPES = [
  { value: 'tech', label: 'Technology' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const;

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Product Type
        </h3>
        <div className="space-y-2">
          {PRODUCT_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={searchParams.get('type') === type.value}
                onChange={(e) => {
                  router.push(
                    `/?${createQueryString('type', e.target.value)}`,
                    { scroll: false }
                  );
                }}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Sort By
        </h3>
        <select
          value={searchParams.get('sort') || 'newest'}
          onChange={(e) => {
            router.push(`/?${createQueryString('sort', e.target.value)}`, {
              scroll: false,
            });
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Status
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={searchParams.get('status') !== 'sold'}
              onChange={(e) => {
                router.push(
                  `/?${createQueryString(
                    'status',
                    e.target.checked ? 'available' : 'sold'
                  )}`,
                  { scroll: false }
                );
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            <span>Show Available Items</span>
          </label>
        </div>
      </div>
    </div>
  );
} 