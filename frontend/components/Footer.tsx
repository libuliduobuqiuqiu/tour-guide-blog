const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Janet Tours</h3>
          <p className="text-gray-400">Your professional tour guide in Chongqing & Chengdu.</p>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-blue-400">Facebook</a>
          <a href="#" className="hover:text-blue-400">Instagram</a>
          <a href="#" className="hover:text-blue-400">WeChat</a>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Janet Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
