import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#fcfcfc] dark:bg-[#07090e] border-t border-zinc-200/60 dark:border-zinc-900/60 py-12 md:py-16 transition-colors duration-500 font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></span>
            <span className="font-black text-lg uppercase tracking-wider text-zinc-900 dark:text-white">
              HostelX
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-semibold">
            The trusted peer-to-peer marketplace built exclusively for Chandigarh University hostellers. Buy, sell, rent, and discover items safely inside your hostel community.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Platform
          </h4>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/about" 
                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/help" 
                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
              >
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Trust & Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <Link 
                to="/privacy-policy" 
                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link 
                to="/terms" 
                className="text-xs font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        <span>© 2026 HostelX. All Rights Reserved.</span>
        <div className="flex gap-4">
          <span>Chandigarh University Campus</span>
          <span>&middot;</span>
          <span>Verified Student Community</span>
        </div>
      </div>
    </footer>
  );
}
