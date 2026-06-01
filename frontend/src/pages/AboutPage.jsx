import { Flame, ArrowLeft, Target, Rocket, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function AboutPage() {
  const { user } = useAuth();

  const roadmapItems = [
    {
      quarter: "Phase 1: CU Launch",
      title: "Hyper-Local Marketplace",
      desc: "Deploy core features to Zakir, Sukhna, and NC hostel blocks for direct peer trading of mattresses, lamps, study gadgets."
    },
    {
      quarter: "Phase 2: Trust Badges",
      title: "Verified Student Badges",
      desc: "Implement QR-code based meetup verification to track successful trades and compute seller trust points dynamically."
    },
    {
      quarter: "Phase 3: Secure Escrow",
      title: "Safe Payments Engine",
      desc: "Integrate student UPI escrow accounts to lock funds safely until products are physically inspected and handed over."
    },
    {
      quarter: "Phase 4: Multi-Campus",
      title: "Regional Hostel Networks",
      desc: "Expand the network to connect neighboring campuses across Punjab and Chandigarh with localized hostel channels."
    }
  ];

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

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 z-10 relative flex-grow space-y-12">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-550/10 text-xs font-bold tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Built for Chandigarh University Hostellers
          </h1>
          <p className="text-sm text-[#475569] dark:text-zinc-300 max-w-2xl leading-relaxed">
            HostelX is a premium peer-to-peer exchange created to solve the hyper-local trade challenges of Chandigarh University hostel residents. From study lamps to exit clearance sales, we keep trading safe, instant, and entirely inside campus gates.
          </p>
        </div>

        {/* Core Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Why HostelX was Built</h3>
            </div>
            <p className="text-sm text-[#475569] dark:text-zinc-300 leading-relaxed font-semibold">
              Hostel life is fast-paced. Students join hostels every semester needing mattresses, routers, and lamps, while exiting students struggle to sell off functional room utilities before deadlines. Relying on generic classification websites leads to scam attempts and coordinates trade with non-students. HostelX was engineered to restrict commerce inside verified hostel buildings.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Our Core Mission</h3>
            </div>
            <p className="text-sm text-[#475569] dark:text-zinc-300 leading-relaxed font-semibold">
              Our mission is to establish a secure, friction-free circular economy across university blocks. We want to maximize resource recycling, eradicate student financial wastage during semesters, and build high-quality peer trust through verified secure QR integrations and feedback loops.
            </p>
          </div>
        </div>

        {/* Chandigarh University focus section - Redesigned Card */}
        <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">CHANDIGARH UNIVERSITY HOSTEL NETWORK</span>
          </div>
          <h3 className="font-extrabold text-xl text-[#0F172A] dark:text-white">Exclusive Chandigarh University Integration</h3>
          <p className="text-sm text-[#475569] dark:text-zinc-300 leading-relaxed font-semibold">
            HostelX is designed specifically for Chandigarh University hostellers. Students can browse listings based on their selected hostel block, making it easier to discover nearby deals, connect with residents, and arrange quick in-person handovers.
          </p>
          <p className="text-sm text-[#475569] dark:text-zinc-300 leading-relaxed font-semibold">
            Supported hostel groups include: NC1, NC2, NC3, NC4, NC5, NC6, Zakir A, Zakir B, Zakir C, Zakir D, City Hostels, and additional hostel blocks added by administrators.
          </p>
          <p className="text-sm text-[#475569] dark:text-zinc-300 leading-relaxed font-semibold">
            The goal is to create a trusted hostel-first marketplace experience.
          </p>
        </div>

        {/* Future Roadmap */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Future Roadmap</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roadmapItems.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-2 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-[8.5px] font-bold uppercase tracking-widest rounded-bl-xl text-[#64748B]">
                  {item.quarter}
                </div>
                <h4 className="font-bold text-sm text-[#0F172A] dark:text-white pt-2">{item.title}</h4>
                <p className="text-xs text-[#475569] dark:text-zinc-300 font-semibold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Premium Footer */}
      <Footer />

    </div>
  );
}
