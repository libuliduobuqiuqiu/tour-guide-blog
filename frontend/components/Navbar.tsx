import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Janet Tours
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition-colors">
              行程
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
              博客
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              关于我
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              联系
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
