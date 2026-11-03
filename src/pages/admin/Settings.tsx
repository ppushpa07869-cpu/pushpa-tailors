
import { useEffect, useState } from 'react';
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react';

import {
  getBusinessSettings,
  saveBusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
  type BusinessSettings
} from '../../services/businessSettingsService';

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>(
    DEFAULT_BUSINESS_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved business settings from Firestore.
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getBusinessSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading business settings:', error);
        setErrorMessage(
          'Unable to load settings. Check your Firebase connection and permissions.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Update individual input fields.
  function handleChange(
    field: keyof BusinessSettings,
    value: string
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  // Save settings to Firestore.
  async function handleSave() {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      await saveBusinessSettings(settings);

      setSuccessMessage('Business settings saved successfully.');
    } catch (error) {
      console.error('Error saving business settings:', error);
      setErrorMessage(
        'Failed to save settings. Check your Firebase admin permissions.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="animate-spin" size={28} />
        <span className="ml-3">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <SettingsIcon size={28} />
          <h1 className="text-2xl font-bold">Business Settings</h1>
        </div>

        <p className="mt-2 text-gray-500">
          Update your shop details displayed on the website.
        </p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Shop Name
          </label>
          <input
            type="text"
            value={settings.shopName}
            onChange={(event) =>
              handleChange('shopName', event.target.value)
            }
            placeholder="Enter shop name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.phoneNumber}
            onChange={(event) =>
              handleChange('phoneNumber', event.target.value)
            }
            placeholder="+91 9876543210"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={settings.whatsappNumber}
            onChange={(event) =>
              handleChange('whatsappNumber', event.target.value)
            }
            placeholder="+91 9876543210"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Shop Address
          </label>
          <textarea
            value={settings.address}
            onChange={(event) =>
              handleChange('address', event.target.value)
            }
            placeholder="Enter complete shop address"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
