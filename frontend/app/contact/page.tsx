'use client';

import { useEffect, useState } from 'react';
import { sendContactMessage } from '@/lib/api';
import { Mail, MessageCircle, QrCode } from 'lucide-react';
import { withPublicOrigin } from '@/lib/url';

type SiteSettings = {
  contact_location: string;
  contact_email: string;
  contact_phone: string;
  wechat_id: string;
  wechat_qr_image: string;
  whatsapp_qr_image: string;
};

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const defaultSiteSettings: SiteSettings = {
  contact_location: 'Chongqing & Chengdu, China',
  contact_email: '',
  contact_phone: '',
  wechat_id: 'JanetTravels',
  wechat_qr_image: '',
  whatsapp_qr_image: '',
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Contact() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!isValidEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      await sendContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_HOST = process.env.NEXT_PUBLIC_API_URL || '';
        const API_BASE_URL = API_HOST ? (API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`) : '/api';
        const res = await fetch(`${API_BASE_URL}/config/site_settings`);
        if (!res.ok) return;
        const data = await res.json();
        setSiteSettings((prev) => ({ ...prev, ...data }));
      } catch {
        // keep defaults
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 fade-up">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-wide text-slate-900">Contact Me</h1>
          <p className="text-slate-600 text-lg">Have questions or want a private tour? Drop us a message.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Mail size={18} className="text-blue-700" /> Email</h3>
              <p className="text-slate-600 break-all">{siteSettings.contact_email || 'Please configure a valid contact email in admin settings.'}</p>
            </div>
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MessageCircle size={18} className="text-blue-700" /> Contact Now</h3>
              <p className="text-slate-600">WeChat: {siteSettings.wechat_id}</p>
              <p className="text-slate-600">WhatsApp: {siteSettings.contact_phone || 'Not configured'}</p>
            </div>
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><QrCode size={18} className="text-blue-700" /> Scan To Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <div className="mx-auto flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {siteSettings.wechat_qr_image ? (
                      <img
                        src={withPublicOrigin(siteSettings.wechat_qr_image)}
                        alt="WeChat QR code"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="px-3 text-xs text-slate-400">WeChat QR not configured</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700">WeChat</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-center">
                  <div className="mx-auto flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {siteSettings.whatsapp_qr_image ? (
                      <img
                        src={withPublicOrigin(siteSettings.whatsapp_qr_image)}
                        alt="WhatsApp QR code"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="px-3 text-xs text-slate-400">WhatsApp QR not configured</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700">WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 elevated-card p-8 fade-up">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3"
                  placeholder="How can I help you?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3"
                  placeholder="Tell me more about your travel plans..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-3 ${status === 'loading' ? 'bg-gray-400 cursor-not-allowed text-white rounded-xl' : 'btn-primary'
                  }`}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-green-600 text-center font-semibold">Message sent successfully! I&apos;ll get back to you soon.</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-center font-semibold">{errorMessage || 'Failed to send message. Please try again later.'}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
