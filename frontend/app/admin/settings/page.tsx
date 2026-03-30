'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { uploadAdminImage } from '@/lib/admin-upload';
import { Save, RefreshCcw } from 'lucide-react';
import { withPublicOrigin } from '@/lib/url';
import type { Review } from '@/lib/reviews';
import type { SocialAdminSettings, SocialStatus } from '@/lib/social';

const defaultSettings = {
  home_hero_title: 'Professional Tour Guide in Chongqing & Chengdu',
  home_hero_subtitle: 'Discover the hidden gems of Southwest China with Janet.',
  home_static_image: '',
  home_featured_review_ids: [0, 0, 0, 0],
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
  social_x: '',
  icp_number: ''
};

const defaultSocialSettings: SocialAdminSettings = {
  instagram: {
    username: '',
    profile_url: '',
    post_limit: 12,
    account_id: '',
    client_id: '',
    client_secret: '',
    redirect_uri: '',
    access_token: '',
    refresh_token: '',
  },
  tiktok: {
    username: '',
    profile_url: '',
    post_limit: 12,
    account_id: '',
    client_id: '',
    client_secret: '',
    redirect_uri: '',
    access_token: '',
    refresh_token: '',
  },
};

const defaultSocialStatus: SocialStatus = {
  instagram: {
    configured: false,
    connected: false,
    username: '',
    item_count: 0,
    last_sync_at: '',
    last_sync_error: '',
  },
  tiktok: {
    configured: false,
    connected: false,
    username: '',
    item_count: 0,
    last_sync_at: '',
    last_sync_error: '',
  },
};

function normalizeFeaturedReviewIds(value: unknown) {
  const values = Array.isArray(value) ? value : [];
  const ids = values
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
    .slice(0, 4);

  while (ids.length < 4) {
    ids.push(0);
  }

  return ids;
}

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [socialSettings, setSocialSettings] = useState<SocialAdminSettings>(defaultSocialSettings);
  const [socialStatus, setSocialStatus] = useState<SocialStatus>(defaultSocialStatus);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, reviewsRes, socialSettingsRes, socialStatusRes, socialConfigRes] = await Promise.all([
          api.get('/api/config/site_settings').catch(() => null),
          api.get('/api/admin/reviews').catch(() => null),
          api.get('/api/admin/social/settings').catch(() => null),
          api.get('/api/admin/social/status').catch(() => null),
          api.get('/api/config/social_settings').catch(() => null),
        ]);

        if (settingsRes?.data) {
          const parsed = typeof settingsRes.data === 'string' ? JSON.parse(settingsRes.data) : settingsRes.data;
          setSettings({
            ...defaultSettings,
            ...parsed,
            home_featured_review_ids: normalizeFeaturedReviewIds(parsed?.home_featured_review_ids),
          });
        }

        const reviewPayload = reviewsRes?.data;
        const reviewList = Array.isArray(reviewPayload)
          ? reviewPayload
          : Array.isArray(reviewPayload?.data)
            ? reviewPayload.data
            : Array.isArray(reviewPayload?.list)
              ? reviewPayload.list
              : [];
        setReviews(reviewList);
        const socialSettingsPayload = socialSettingsRes?.data || socialConfigRes?.data;
        if (socialSettingsPayload) {
          setSocialSettings({
            instagram: { ...defaultSocialSettings.instagram, ...socialSettingsPayload.instagram },
            tiktok: { ...defaultSocialSettings.tiktok, ...socialSettingsPayload.tiktok },
          });
        }
        if (socialStatusRes?.data) {
          setSocialStatus({
            instagram: { ...defaultSocialStatus.instagram, ...socialStatusRes.data.instagram },
            tiktok: { ...defaultSocialStatus.tiktok, ...socialStatusRes.data.tiktok },
          });
        }
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

  const handleHomeStaticImageUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      setSettings((prev) => ({ ...prev, home_static_image: url }));
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
      await Promise.all([
        api.put('/api/admin/config/site_settings', {
          value: JSON.stringify(settings)
        }),
        api.put('/api/admin/config/social_settings', {
          value: JSON.stringify(socialSettings)
        }),
        api.put('/api/admin/config/about', {
          value: JSON.stringify({
            name: 'Janet',
            bio: settings.about_content,
            image: settings.about_image || '/images/janet.jpg'
          })
        }),
      ]);

      const statusRes = await api.get('/api/admin/social/status').catch(() => null);
      if (statusRes?.data) {
        setSocialStatus({
          instagram: { ...defaultSocialStatus.instagram, ...statusRes.data.instagram },
          tiktok: { ...defaultSocialStatus.tiktok, ...statusRes.data.tiktok },
        });
      }
      alert('Settings saved successfully!');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to save settings')
          : 'Failed to save settings';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const updateFeaturedReview = (index: number, value: string) => {
    const next = [...settings.home_featured_review_ids];
    next[index] = Number.parseInt(value, 10) || 0;
    setSettings({ ...settings, home_featured_review_ids: next });
  };

  const updateSocialPlatform = (
    platform: 'instagram' | 'tiktok',
    field: keyof SocialAdminSettings['instagram'],
    value: string
  ) => {
    const nextValue =
      field === 'post_limit'
        ? Math.max(1, Math.min(24, Number.parseInt(value, 10) || 12))
        : value;

    setSocialSettings((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: nextValue,
      },
    }));
  };

  const handleSocialSync = async (platform: 'instagram' | 'tiktok' | 'all') => {
    setSyncingPlatform(platform);
    try {
      await api.put('/api/admin/config/social_settings', {
        value: JSON.stringify(socialSettings)
      });
      await api.post('/api/admin/social/sync', { platform });
      const [statusRes] = await Promise.all([
        api.get('/api/admin/social/status').catch(() => null),
      ]);
      if (statusRes?.data) {
        setSocialStatus({
          instagram: { ...defaultSocialStatus.instagram, ...statusRes.data.instagram },
          tiktok: { ...defaultSocialStatus.tiktok, ...statusRes.data.tiktok },
        });
      }
      alert(`Social sync completed for ${platform}.`);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Social sync failed')
          : 'Social sync failed';
      alert(message);
    } finally {
      setSyncingPlatform(null);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Static Image</label>
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => handleHomeStaticImageUpload(e.target.files?.[0])}
                  className="w-full md:w-auto"
                />
                <input
                  type="text"
                  value={settings.home_static_image}
                  onChange={(e) => setSettings({ ...settings, home_static_image: e.target.value })}
                  placeholder="Or paste image URL"
                  className="flex-1 px-4 py-2"
                />
              </div>
              {settings.home_static_image && (
                <div className="mt-4">
                  <img
                    src={withPublicOrigin(settings.home_static_image)}
                    alt="Home static preview"
                    className="w-full max-w-md h-44 rounded-2xl object-cover border"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Used as homepage hero image when no carousel image is configured.</p>
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
                    src={withPublicOrigin(settings.about_image)}
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
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-amber-700">Home Page Reviews</h2>
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-700">Choose the 4 review cards shown below the Why Choose Me section on the homepage.</p>
              <p className="text-xs text-gray-500 mt-1">Leaving a slot empty will fall back to the next active review automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {settings.home_featured_review_ids.map((reviewId, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Card {index + 1}
                  </label>
                  <select
                    value={reviewId}
                    onChange={(e) => updateFeaturedReview(index, e.target.value)}
                    className="w-full px-4 py-2"
                  >
                    <option value={0}>Auto select</option>
                    {reviews.map((review) => (
                      <option key={review.id} value={review.id}>
                        {review.username} · {review.country || 'Unknown country'} · {review.review_date ? review.review_date.slice(0, 7) : 'No date'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-panel p-8">
          <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-rose-700">Social Integrations</h2>
              <p className="mt-1 text-sm text-gray-500">
                Add the Instagram or TikTok profile URL below, then sync the latest posts used by the homepage social carousels.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSocialSync('instagram')}
                disabled={syncingPlatform !== null}
                className="btn-secondary px-4 py-2 disabled:opacity-60"
              >
                {syncingPlatform === 'instagram' ? 'Syncing Instagram...' : 'Sync Instagram'}
              </button>
              <button
                type="button"
                onClick={() => handleSocialSync('tiktok')}
                disabled={syncingPlatform !== null}
                className="btn-secondary px-4 py-2 disabled:opacity-60"
              >
                {syncingPlatform === 'tiktok' ? 'Syncing TikTok...' : 'Sync TikTok'}
              </button>
              <button
                type="button"
                onClick={() => handleSocialSync('all')}
                disabled={syncingPlatform !== null}
                className="btn-primary px-4 py-2 disabled:opacity-60"
              >
                {syncingPlatform === 'all' ? 'Syncing All...' : 'Sync All'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {(['instagram', 'tiktok'] as const).map((platform) => {
              const platformSettings = socialSettings[platform];
              const platformStatus = socialStatus[platform];
              const title = platform === 'instagram' ? 'Instagram' : 'TikTok';
              const profilePlaceholder =
                platform === 'instagram'
                  ? 'https://www.instagram.com/yourhandle/'
                  : 'https://www.tiktok.com/@yourhandle';

              return (
                <div key={platform} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Configured: {platformStatus.configured ? 'Yes' : 'No'} · Connected: {platformStatus.connected ? 'Yes' : 'No'} · Items: {platformStatus.item_count}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>{platformStatus.username || 'No username set'}</div>
                      <div>{platformStatus.last_sync_at ? `Last sync: ${platformStatus.last_sync_at}` : 'Not synced yet'}</div>
                    </div>
                  </div>

                  {platformStatus.last_sync_error && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {platformStatus.last_sync_error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      Save the profile URL first, then use the sync buttons above to refresh the homepage feed. Other platform credentials are no longer required here.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile URL</label>
                      <input
                        type="url"
                        value={platformSettings.profile_url}
                        onChange={(e) => updateSocialPlatform(platform, 'profile_url', e.target.value)}
                        className="w-full px-4 py-2"
                        placeholder={profilePlaceholder}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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

        <section className="admin-panel p-8">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2 text-slate-700">Footer ICP</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ICP Registration Number</label>
            <input
              type="text"
              value={settings.icp_number}
              onChange={(e) => setSettings({ ...settings, icp_number: e.target.value })}
              className="w-full px-4 py-2"
              placeholder="e.g. 粤ICP备12345678号"
            />
            <p className="text-xs text-gray-500 mt-2">Shown in the site footer, links to the MIIT备案 site.</p>
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
