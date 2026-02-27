import Image from 'next/image';

export default function About() {
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
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80"
                alt="Tour guide portrait"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="md:col-span-2 elevated-card p-8 fade-up">
            <div className="space-y-5 text-slate-700 leading-8">
              <p>
                Hi, I&apos;m <strong>Janet</strong>, your personal tour guide for Chongqing and Chengdu.
                With over 10 years of experience in the travel industry, I specialize in creating
                personalized, off-the-beaten-path experiences that showcase the true soul of Southwest China.
              </p>
              <p>
                My journey as a guide started from my deep love for my hometown, Chongqing.
                I wanted to show visitors that there&apos;s more to this city than just the popular
                tourist spots. From the spicy flavors of authentic local hotpot to the tranquil
                tea houses hidden in old alleys, I&apos;ll take you where the locals go.
              </p>
              <h2 className="text-2xl font-semibold mt-8 mb-2 text-slate-900">Why I Love What I Do</h2>
              <p>
                Traveling is about more than just seeing new places; it&apos;s about connecting with people
                and cultures. I take pride in being a bridge between my culture and yours,
                helping you understand the history, the humor, and the heart of the people here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
