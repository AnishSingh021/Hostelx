import { useState } from 'react';
import { ShieldCheck, Mail, ArrowLeft, Database, MapPin, Key, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('anishsingh10121@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#475569] dark:text-zinc-300 flex flex-col justify-between font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 relative border-b border-[#E2E8F0] dark:border-zinc-900 bg-white dark:bg-[#090D16]">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span className="font-extrabold text-sm tracking-wider text-[#0F172A] dark:text-white">HostelX Hub</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/auth"} 
          className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 hover:underline transition"
        >
          {user ? "Dashboard →" : "Sign In →"}
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 z-10 relative flex-grow">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Hero */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold tracking-wide text-blue-600">
            <ShieldCheck className="w-4 h-4" /> Trust & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#475569] dark:text-zinc-300 max-w-2xl leading-relaxed">
            Last Updated: June 1, 2026. HostelX is committed to safeguarding the trust and data of Chandigarh University hostellers. Learn about how we handle data collections, authorization systems, location trackers, and user storage assets.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8 font-medium">
          
          {/* Card 1: Data Collection */}
          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Data Collection</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#475569] dark:text-zinc-300">
              We collect information to facilitate safe, trusted transactions within Chandigarh University hostels. This includes your name, institutional email address, details regarding listings you post, and metadata about completed QR-code trust handovers.
            </p>
          </div>

          {/* Card 2: Firebase Auth Usage */}
          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Firebase Authentication</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#475569] dark:text-zinc-300">
              We utilize official Firebase Authentication to register and sign in users securely. Firebase Auth handles passwords, multi-factor logins, and email-verification links. Under no circumstances do our servers read, store, or transmit your account passwords.
            </p>
          </div>

          {/* Card 3: Location / GPS Usage */}
          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Location and GPS Usage</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#475569] dark:text-zinc-300">
              HostelX leverages browser-level GPS/Geolocation APIs to power our Smart Nearby Radar, calculating estimated walking time estimates and walking radii between sellers. We only fetch your current location when the Radar is active. This location data is processed locally inside your browser and is never tracked continuously or stored persistently on backend servers.
            </p>
          </div>

          {/* Card 4: User Data Storage */}
          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">User Data Storage</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#475569] dark:text-zinc-300">
              All profile configurations, product descriptions, listing images, bid histories, and chat logs are stored securely using MongoDB Atlas database nodes. Access is governed by strict cloud authorization protocols, preventing external queries or unauthenticated data dumps.
            </p>
          </div>

          {/* Contact Section - Redesigned Card */}
          <div className="bg-white dark:bg-zinc-950 border-2 border-blue-100 dark:border-blue-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-[#0F172A] dark:text-white">Have Privacy Questions?</h3>
              <p className="text-sm leading-relaxed text-[#475569] dark:text-zinc-300">
                For questions regarding privacy, data usage, account security, or platform policies, contact us anytime.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="mailto:anishsingh10121@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-900 hover:bg-blue-100 transition"
              >
                <Mail className="w-4 h-4" /> anishsingh10121@gmail.com
              </a>
              <button 
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[#475569] dark:text-zinc-300 font-bold text-sm transition cursor-pointer"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Premium Reusable Footer */}
      <Footer />

    </div>
  );
}
