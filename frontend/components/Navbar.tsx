import Link from 'next/link';
import { Compass } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { href: '/tours', label: 'Tours' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 md:gap-3 md:py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-white shadow-lg shadow-blue-200">
              <Compass size={18} />
            </span>
            <Link href="/" className="text-2xl font-semibold tracking-wide text-slate-900">
              Tour<span className="text-blue-700">Janet</span>
            </Link>
          </div>

          <div className="nav-scroll-row -mx-1 flex w-full flex-nowrap items-center gap-0.5 overflow-x-auto px-1 md:mx-0 md:w-auto md:gap-2 md:overflow-visible md:px-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-none rounded-full px-2.5 py-1.5 text-[0.8rem] font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-700 md:px-4 md:py-2 md:text-[0.92rem]"
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
