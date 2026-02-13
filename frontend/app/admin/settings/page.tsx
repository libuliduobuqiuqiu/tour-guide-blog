'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Save, RefreshCcw } from 'lucide-react';

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    home_hero_title: 'Professional Tour Guide in Chongqing & Chengdu',
    home_hero_subtitle: 'Discover the hidden gems of Southwest China with Janet.',
    about_content: '',
    contact_email: 'janet@example.com',
    contact_phone: '+86 123 4567 8901',
    wechat_id: 'janet_tours'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/config/site_settings');
        if (res.data) {
          setSettings(JSON.parse(res.data));
        }
      } catch (err) {
        console.log('No existing settings found, using defaults');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 保存到通用的 config 接口
      await api.put('/admin/config/site_settings', {
        value: JSON.stringify(settings)
      });
      // 同时更新 about 接口的数据（为了兼容之前的 API）
      await api.put('/admin/config/about', {
        value: JSON.stringify({
          name: 'Janet',
          bio: settings.about_content,
          image: '/images/janet.jpg'
        })
      });
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-bold mb-6 border-b pb-2 text-blue-600">Home Page (Hero Section)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={settings.home_hero_title}
                onChange={(e) => setSettings({ ...settings, home_hero_title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settings.home_hero_subtitle}
                onChange={(e) => setSettings({ ...settings, home_hero_subtitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-bold mb-6 border-b pb-2 text-green-600">About Me</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Introduction Content</label>
            <textarea
              rows={6}
              value={settings.about_content}
              onChange={(e) => setSettings({ ...settings, about_content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell your story..."
            />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-bold mb-6 border-b pb-2 text-purple-600">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WeChat ID</label>
              <input
                type="text"
                value={settings.wechat_id}
                onChange={(e) => setSettings({ ...settings, wechat_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-gray-400"
          >
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
