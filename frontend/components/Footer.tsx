import { getServerApiBaseUrl } from '@/lib/server-api';

type SiteSettings = {
  social_tiktok?: string;
  social_instagram?: string;
  social_xiaohongshu?: string;
  social_youtube?: string;
  social_x?: string;
  footer_title?: string;
  footer_description?: string;
  icp_number?: string;
  public_security_beian?: string;
};

function PoliceBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="shrink-0 fill-current">
      <path d="M12 2.5 4.8 5.3v5.56c0 4.61 2.84 8.7 7.2 10.64 4.36-1.94 7.2-6.03 7.2-10.64V5.3L12 2.5Zm0 2.1 5.1 1.98v4.28c0 3.55-2.05 6.75-5.1 8.39-3.05-1.64-5.1-4.84-5.1-8.39V6.58L12 4.6Zm-.94 3.34v2.42H8.64v1.88h2.42v2.42h1.88v-2.42h2.42v-1.88h-2.42V7.94h-1.88Z" />
    </svg>
  );
}

const Footer = async () => {
  const API_BASE_URL = getServerApiBaseUrl();
  let settings: SiteSettings = {};

  try {
    const res = await fetch(`${API_BASE_URL}/config/site_settings`, { cache: 'no-store' });
    if (res.ok) {
      settings = (await res.json()) as SiteSettings;
    }
  } catch {
    // ignore and keep defaults
  }

  const socials = [
    { key: 'social_tiktok', label: 'TikTok', className: 'fa-brands fa-tiktok', href: settings.social_tiktok, tone: 'from-sky-400/20 to-blue-400/15' },
    { key: 'social_instagram', label: 'Instagram', className: 'fa-brands fa-instagram', href: settings.social_instagram, tone: 'from-pink-400/20 to-orange-300/15' },
    { key: 'social_youtube', label: 'YouTube', className: 'fa-brands fa-youtube', href: settings.social_youtube, tone: 'from-red-400/20 to-rose-300/15' },
    { key: 'social_x', label: 'X', className: 'fa-brands fa-x-twitter', href: settings.social_x, tone: 'from-slate-200/20 to-slate-400/10' },
    { key: 'social_xiaohongshu', label: 'Xiaohongshu', href: settings.social_xiaohongshu, tone: 'from-rose-400/20 to-pink-300/15' },
  ].filter((item) => item.href);

  const footerTitle = settings.footer_title?.trim() || 'Private tours with clear local guidance.';
  const footerDescription =
    settings.footer_description?.trim() || 'Your professional tour guide in Guangzhou, Chongqing and Chengdu.';

  return (
    <footer
      className="relative overflow-hidden py-14 text-white"
      style={{
        backgroundImage:
          "linear-gradient(130deg, rgba(9,21,45,0.94), rgba(26,56,114,0.88)), url('https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.22),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="fade-up px-2 py-2 md:px-4">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">Tour Janet</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-wide text-white md:text-[2rem]">{footerTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base">{footerDescription}</p>
            </div>

            {socials.length > 0 && (
              <div className="min-w-0 lg:max-w-[34rem]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">Follow Janet</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socials.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-gradient-to-br ${item.tone} px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/10`}
                      aria-label={item.label}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-base">
                        {item.className ? (
                          <i className={item.className} />
                        ) : (
                          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="fill-current">
                            <path d="M4 6.25C4 5.56 4.56 5 5.25 5h13.5c.69 0 1.25.56 1.25 1.25v11.5c0 .69-.56 1.25-1.25 1.25H5.25C4.56 20 4 19.44 4 18.75V6.25zm3.2 2.1h6.4c.6 0 1.1.5 1.1 1.1v6.1c0 .6-.5 1.1-1.1 1.1H7.2c-.6 0-1.1-.5-1.1-1.1v-6.1c0-.6.5-1.1 1.1-1.1zm9.3.7a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" />
                          </svg>
                        )}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex flex-col gap-3 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Tour Janet. All rights reserved.</p>

              {(settings.icp_number || settings.public_security_beian) && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {settings.icp_number && (
                    <a
                      href="https://beian.miit.gov.cn/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-200 transition-colors hover:text-white"
                    >
                      {settings.icp_number}
                    </a>
                  )}

                  {settings.public_security_beian && (
                    <a
                      href="https://beian.mps.gov.cn/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-slate-200 transition-colors hover:text-white"
                    >
                      <PoliceBadgeIcon />
                      <span>{settings.public_security_beian}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
