type SiteSettings = {
  social_tiktok?: string;
  social_instagram?: string;
  social_xiaohongshu?: string;
  social_youtube?: string;
  social_x?: string;
};

const Footer = async () => {
  const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;
  let settings: SiteSettings = {};

  try {
    const res = await fetch(`${API_BASE_URL}/config/site_settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      settings = (await res.json()) as SiteSettings;
    }
  } catch {
    // ignore and keep defaults
  }

  const socials = [
    { key: 'social_tiktok', label: 'TikTok', className: 'fa-brands fa-tiktok', href: settings.social_tiktok },
    { key: 'social_instagram', label: 'Instagram', className: 'fa-brands fa-instagram', href: settings.social_instagram },
    { key: 'social_youtube', label: 'YouTube', className: 'fa-brands fa-youtube', href: settings.social_youtube },
    { key: 'social_x', label: 'X', className: 'fa-brands fa-x-twitter', href: settings.social_x },
    { key: 'social_xiaohongshu', label: 'Xiaohongshu', href: settings.social_xiaohongshu },
  ].filter((item) => item.href);

  return (
    <footer
      className="relative mt-16 text-white py-14 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(130deg, rgba(9,21,45,0.92), rgba(26,56,114,0.86)), url('https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.25),transparent_35%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-up">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-wide mb-2">Janet Tours</h3>
          <p className="text-slate-200">Your professional tour guide in Guangzhou, Chongqing and Chengdu.</p>
        </div>

        {socials.length > 0 && (
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {socials.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/14 hover:bg-white/24 flex items-center justify-center transition-all hover:-translate-y-0.5"
                aria-label={item.label}
              >
                {item.className ? (
                  <i className={item.className} />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="fill-current">
                    <path d="M4 6.25C4 5.56 4.56 5 5.25 5h13.5c.69 0 1.25.56 1.25 1.25v11.5c0 .69-.56 1.25-1.25 1.25H5.25C4.56 20 4 19.44 4 18.75V6.25zm3.2 2.1h6.4c.6 0 1.1.5 1.1 1.1v6.1c0 .6-.5 1.1-1.1 1.1H7.2c-.6 0-1.1-.5-1.1-1.1v-6.1c0-.6.5-1.1 1.1-1.1zm9.3.7a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        )}

        <p className="text-slate-300 text-sm tracking-wide">
          © 2026 Janet Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
