'use client';

import { useEffect, useState } from 'react';
import { sendContactMessage } from '@/lib/api';
import { MapPin, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [siteSettings, setSiteSettings] = useState({
    contact_location: 'Chongqing & Chengdu, China',
    contact_email: 'janet@tourguide.com',
    contact_phone: '+86 123 4567 8900',
    wechat_id: 'JanetTravels',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await sendContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;
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
          <p className="text-slate-600 text-lg">Have questions or want to plan a custom tour? Drop me a message.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MapPin size={18} className="text-blue-700" /> Location</h3>
              <p className="text-slate-600">{siteSettings.contact_location}</p>
            </div>
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Mail size={18} className="text-blue-700" /> Email</h3>
              <p className="text-slate-600">{siteSettings.contact_email}</p>
            </div>
            <div className="elevated-card p-5">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><MessageCircle size={18} className="text-blue-700" /> Social</h3>
              <p className="text-slate-600">WeChat: {siteSettings.wechat_id}</p>
              <p className="text-slate-600">Phone: {siteSettings.contact_phone}</p>
            </div>
          </div>

          <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 elevated-card p-8 fade-up">
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
              className={`w-full py-3 ${
                status === 'loading' ? 'bg-gray-400 cursor-not-allowed text-white rounded-xl' : 'btn-primary'
              }`}
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="text-green-600 text-center font-semibold">Message sent successfully! I&apos;ll get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-center font-semibold">Failed to send message. Please try again later.</p>
            )}
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
