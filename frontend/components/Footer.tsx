const Footer = () => {
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

        <div className="flex justify-center gap-4 mb-8">
          <a href="#" className="w-10 h-10 rounded-full bg-white/14 hover:bg-white/24 flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="Facebook">
            <i className="fa-brands fa-facebook-f" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/14 hover:bg-white/24 flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="Instagram">
            <i className="fa-brands fa-instagram" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/14 hover:bg-white/24 flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="WeChat">
            <i className="fa-brands fa-weixin" />
          </a>
        </div>

        <p className="text-slate-300 text-sm tracking-wide">
          © {new Date().getFullYear()} Janet Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
