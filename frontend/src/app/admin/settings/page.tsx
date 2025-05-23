'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';

interface Settings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requirePhoneVerification: boolean;
  maxOffersPerProduct: number;
  minOfferAmount: number;
  maxProductImages: number;
  notificationEmail: string;
}

async function getSettings() {
  const response = await fetch('/api/admin/settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}

async function updateSettings(settings: Partial<Settings>) {
  const response = await fetch('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Settings>>({});

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['adminSettings'],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleToggleChange = (key: keyof Settings) => {
    const newValue = !settings?.[key];
    setFormData((prev) => ({ ...prev, [key]: newValue }));
    updateMutation.mutate({ [key]: newValue });
  };

  const handleNumberChange = (key: keyof Settings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, [key]: numValue }));
      updateMutation.mutate({ [key]: numValue });
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, notificationEmail: value }));
    updateMutation.mutate({ notificationEmail: value });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Settings
      </h1>

      <div className="mt-8 space-y-6">
        {/* System Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            System Settings
          </h2>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="maintenance-mode"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable maintenance mode to temporarily disable the platform
                </p>
              </div>
              <Switch
                checked={settings?.maintenanceMode}
                onChange={() => handleToggleChange('maintenanceMode')}
                className={classNames(
                  settings?.maintenanceMode
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings?.maintenanceMode
                      ? 'translate-x-5'
                      : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="allow-registrations"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Allow New Registrations
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable new user registrations
                </p>
              </div>
              <Switch
                checked={settings?.allowNewRegistrations}
                onChange={() => handleToggleChange('allowNewRegistrations')}
                className={classNames(
                  settings?.allowNewRegistrations
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings?.allowNewRegistrations
                      ? 'translate-x-5'
                      : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="phone-verification"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Require Phone Verification
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Require phone number verification for new users
                </p>
              </div>
              <Switch
                checked={settings?.requirePhoneVerification}
                onChange={() => handleToggleChange('requirePhoneVerification')}
                className={classNames(
                  settings?.requirePhoneVerification
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                )}
              >
                <span
                  className={classNames(
                    settings?.requirePhoneVerification
                      ? 'translate-x-5'
                      : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>
          </div>
        </div>

        {/* Product Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Product Settings
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="max-offers"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Offers per Product
              </label>
              <input
                type="number"
                id="max-offers"
                value={settings?.maxOffersPerProduct}
                onChange={(e) =>
                  handleNumberChange('maxOffersPerProduct', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="min-offer"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Minimum Offer Amount (MWK)
              </label>
              <input
                type="number"
                id="min-offer"
                value={settings?.minOfferAmount}
                onChange={(e) =>
                  handleNumberChange('minOfferAmount', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="max-images"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Maximum Product Images
              </label>
              <input
                type="number"
                id="max-images"
                value={settings?.maxProductImages}
                onChange={(e) =>
                  handleNumberChange('maxProductImages', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Notification Settings
          </h2>
          <div className="mt-6">
            <label
              htmlFor="notification-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Notification Email
            </label>
            <input
              type="email"
              id="notification-email"
              value={settings?.notificationEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="admin@example.com"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Email address to receive system notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 