import Image from 'next/image';

type AboutPayload = {
  name?: string;
  bio?: string;
  image?: string;
};

export default async function About() {
  const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;
  let about: AboutPayload = {
    name: 'Janet',
    bio: 'A professional tour guide in Chongqing & Chengdu.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
  };

  try {
    const res = await fetch(`${API_BASE_URL}/about`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as AboutPayload;
      about = { ...about, ...data };
    }
  } catch {
    // keep defaults
  }

  const imageSrc = about.image
    ? about.image.startsWith('http')
      ? about.image
      : `${API_HOST}${about.image.startsWith('/') ? '' : '/'}${about.image}`
    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80';

  const bioParagraphs = (about.bio || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <header className="mb-10 fade-up">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-wide text-slate-900">About Me</h1>
          <p className="mt-3 text-slate-600 text-lg">Local perspective, personal service, and custom-designed experiences.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-2xl overflow-hidden elevated-card relative">
              <Image
                src={imageSrc}
                alt={about.name ? `${about.name} portrait` : 'Tour guide portrait'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="md:col-span-2 elevated-card p-8 fade-up">
            <div className="space-y-5 text-slate-700 leading-8">
              {bioParagraphs.length > 0 ? (
                bioParagraphs.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))
              ) : (
                <p>
                  Hi, I&apos;m <strong>{about.name || 'Janet'}</strong>, your personal tour guide for Chongqing and Chengdu.
                  With over 10 years of experience in the travel industry, I specialize in creating
                  personalized, off-the-beaten-path experiences that showcase the true soul of Southwest China.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
