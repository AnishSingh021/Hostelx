import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border py-12 md:py-16 font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              HostelX
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-medium">
            The trusted peer-to-peer marketplace built exclusively for Chandigarh University hostellers. Buy, sell, rent, and discover items safely inside your hostel community.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" />
            Verified Student Community
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Platform
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-xs font-medium text-muted-foreground hover:text-primary transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-xs font-medium text-muted-foreground hover:text-primary transition">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-xs font-medium text-muted-foreground hover:text-primary transition">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Trust & Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="text-xs font-medium text-muted-foreground hover:text-primary transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-xs font-medium text-muted-foreground hover:text-primary transition">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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

