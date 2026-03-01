'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { uploadAdminImage } from '@/lib/admin-upload';
import { Save, RefreshCcw } from 'lucide-react';

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const defaultSettings = {
    home_hero_title: 'Professional Tour Guide in Chongqing & Chengdu',
    home_hero_subtitle: 'Discover the hidden gems of Southwest China with Janet.',
    about_content: '',
    about_image: '',
    contact_email: 'janet@example.com',
    contact_phone: '+86 123 4567 8901',
    wechat_id: 'janet_tours',
    contact_location: 'Chongqing & Chengdu, China',
    social_tiktok: '',
    social_instagram: '',
    social_xiaohongshu: '',
    social_youtube: '',
    social_x: ''
  };
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/config/site_settings');
        if (!res.data) return;
        const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setSettings({ ...defaultSettings, ...parsed });
      } catch (err) {
        console.log('No existing settings found, using defaults');
      }
    };
    fetchSettings();
  }, []);

  const handleAboutImageUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      setSettings((prev) => ({ ...prev, about_image: url }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

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
          image: settings.about_image || '/images/janet.jpg'
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
      <h1 className="text-2xl font-semibold tracking-wide mb-8">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="admin-panel p-8">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-blue-700">Home Page (Hero Section)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={settings.home_hero_title}
                onChange={(e) => setSettings({ ...settings, home_hero_title: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settings.home_hero_subtitle}
                onChange={(e) => setSettings({ ...settings, home_hero_subtitle: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
          </div>
        </section>

        <section className="admin-panel p-8">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-green-700">About Me</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guide Avatar</label>
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => handleAboutImageUpload(e.target.files?.[0])}
                  className="w-full md:w-auto"
                />
                <input
                  type="text"
                  value={settings.about_image}
                  onChange={(e) => setSettings({ ...settings, about_image: e.target.value })}
                  placeholder="Or paste image URL"
                  className="flex-1 px-4 py-2"
                />
              </div>
              {settings.about_image && (
                <div className="mt-4">
                  <img
                    src={settings.about_image.startsWith('http') ? settings.about_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${settings.about_image.startsWith('/') ? '' : '/'}${settings.about_image}`}
                    alt="About preview"
                    className="w-32 h-32 rounded-2xl object-cover border"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Introduction Content</label>
              <textarea
                rows={6}
                value={settings.about_content}
                onChange={(e) => setSettings({ ...settings, about_content: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="Tell your story..."
              />
            </div>
          </div>
        </section>

        <section className="admin-panel p-8">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-indigo-700">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={settings.contact_location}
                onChange={(e) => setSettings({ ...settings, contact_location: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WeChat ID</label>
              <input
                type="text"
                value={settings.wechat_id}
                onChange={(e) => setSettings({ ...settings, wechat_id: e.target.value })}
                className="w-full px-4 py-2"
              />
            </div>
          </div>
        </section>

        <section className="admin-panel p-8">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-purple-700">Footer Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
              <input
                type="url"
                value={settings.social_tiktok}
                onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="https://www.tiktok.com/@yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={settings.social_instagram}
                onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="https://www.instagram.com/yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
              <input
                type="url"
                value={settings.social_youtube}
                onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="https://www.youtube.com/@yourchannel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">X</label>
              <input
                type="url"
                value={settings.social_x}
                onChange={(e) => setSettings({ ...settings, social_x: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="https://x.com/yourhandle"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Xiaohongshu</label>
              <input
                type="url"
                value={settings.social_xiaohongshu}
                onChange={(e) => setSettings({ ...settings, social_xiaohongshu: e.target.value })}
                className="w-full px-4 py-2"
                placeholder="https://www.xiaohongshu.com/user/profile/..."
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex items-center gap-2 px-8 py-3 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
