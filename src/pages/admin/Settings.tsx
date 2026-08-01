import { useState } from 'react';
import { Settings as SettingsIcon, Scissors, MessageSquare, MapPin, Moon, Sun, Bell, Database, Check, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const [shopName, setShopName] = useState('Pushpa Tailors');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 9876543210');
  const [address, setAddress] = useState('Main Road, Tailor Street, City Center');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide flex items-center gap-3">
            <SettingsIcon className="h-7 w-7 text-primary" />
            Settings & Preferences
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage shop details, themes, alerts, and system backups.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
        >
          <Check className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {/* 1. Business Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <Scissors className="h-5 w-5 text-primary" />
          Business Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-green-600" />
              WhatsApp Number
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 block mb-1 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-red-500" />
              Shop Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* 2. Theme & Appearance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <Sun className="h-5 w-5 text-amber-500" />
          Theme & Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Theme', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System Default', icon: SettingsIcon },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all font-semibold text-sm ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Notification Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <Bell className="h-5 w-5 text-blue-600" />
          Notification Settings
        </h2>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Delivery & Overdue Alerts</p>
            <p className="text-xs text-gray-500">Show notification badges for overdue and upcoming deliveries</p>
          </div>
          <button
            onClick={() => setEnableAlerts(!enableAlerts)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              enableAlerts ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              enableAlerts ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 4. Backup & System Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <Database className="h-5 w-5 text-purple-600" />
          Backup & Data Protection
        </h2>
        <div className="flex items-center justify-between p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Firebase Cloud Sync Active</p>
              <p className="text-xs text-gray-500">All customer profiles, measurements, orders, and receipts are continuously synced.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            Live Connected
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-gray-900 text-white font-semibold text-sm">
            <span>✅</span>
            Settings updated successfully
          </div>
        </div>
      )}
    </div>
  );
}

