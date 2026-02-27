import Link from 'next/link';
import { Compass } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { href: '/tours', label: 'Tours' },
    { href: '/blog', label: 'Blog' },
    { href: '/reviews', label: 'Guest Reviews' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <Compass size={18} />
            </span>
            <Link href="/" className="text-2xl font-semibold tracking-wide text-slate-900">
              Janet<span className="text-blue-700">Tours</span>
            </Link>
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center gap-2 md:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-full text-[0.92rem] font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
