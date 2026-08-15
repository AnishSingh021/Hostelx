import { ArrowLeft, Target, Rocket, Compass, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-muted-foreground flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 relative border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span className="font-bold text-sm tracking-wider text-foreground">HostelX Hub</span>
        </Link>
        
        <Link 
          to={user ? "/dashboard" : "/auth"} 
          className="text-xs font-bold text-primary hover:underline transition"
        >
          {user ? "Dashboard →" : "Sign In →"}
        </Link>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 z-10 relative flex-grow space-y-12">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
            <Sparkles className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for Chandigarh University Hostellers
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            HostelX is a premium peer-to-peer exchange created to solve the hyper-local trade challenges of Chandigarh University hostel residents. From study lamps to exit clearance sales, we keep trading safe, instant, and entirely inside campus gates.
          </p>
        </div>

        {/* Core Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Why HostelX was Built</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hostel life is fast-paced. Students join hostels every semester needing mattresses, routers, and lamps, while exiting students struggle to sell off room utilities before checkout. Relying on generic classifications leads to scams. HostelX was engineered to restrict commerce inside verified hostel buildings.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Our Core Mission</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our mission is to establish a secure, friction-free circular economy across university blocks. We want to maximize resource recycling, eradicate student financial wastage during semesters, and build high-quality peer trust through verified secure QR integrations and feedback loops.
            </p>
          </div>
        </div>

        {/* Chandigarh University focus section */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">CHANDIGARH UNIVERSITY HOSTEL NETWORK</span>
          </div>
          <h3 className="font-bold text-xl text-foreground">Exclusive Chandigarh University Integration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            HostelX is built specifically for Chandigarh University hostellers. Students can browse listings based on their selected hostel block, making it easier to discover nearby deals, connect with hostel residents, and arrange safe in-person handovers.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Supported hostel groups include:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-muted-foreground pl-2 font-medium">
              <li>• NC1</li>
              <li>• NC2</li>
              <li>• NC3</li>
              <li>• NC4</li>
              <li>• NC5</li>
              <li>• NC6</li>
              <li>• Zakir A</li>
              <li>• Zakir B</li>
              <li>• Zakir C</li>
              <li>• Zakir D</li>
              <li>• City Hostels</li>
            </ul>
          </div>
        </div>

        {/* Future Roadmap */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Future Roadmap</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roadmapItems.map((item, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-2 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 bg-secondary border-l border-b border-border px-3 py-1 text-[8.5px] font-bold uppercase tracking-widest rounded-bl-xl text-muted-foreground">
                  {item.quarter}
                </div>
                <h4 className="font-bold text-sm text-foreground pt-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Reusable Footer */}
      <Footer />

    </div>
  );
}

