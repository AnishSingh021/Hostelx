import { Scale, ArrowLeft, ShieldAlert, ShoppingBag, RotateCcw, Gavel, FileText, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function TermsPage() {
  const { user } = useAuth();

  const sections = [
    {
      icon: <ShoppingBag className="w-5 h-5 text-primary" />,
      title: "Buying & Selling Rules",
      desc: "All transactions on HostelX must be peer-to-peer meetups. Sellers are required to provide accurate condition reports and physical images. Banned items include illegal products, explosive chemicals, or assets violating Chandigarh University dorm policy. Handovers must take place in designated safe campus meetups."
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-primary" />,
      title: "Rental Guidelines",
      desc: "Rental agreements listed must specify either refundable cash deposits or physical student ID collaterals. Renters must return assets on time and in their original state. Late fees or damage assessments must be resolved directly between students in a fair manner."
    },
    {
      icon: <Gavel className="w-5 h-5 text-primary" />,
      title: "Auction Rules",
      desc: "Auctions operate in real-time on 48-hour expiration limits. Placing a bid constitutes a serious contract to purchase the asset if you end as the highest bidder. Failure to claim or pay for your bid within 24 hours of auction completion constitutes a violation of community guidelines."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-primary" />,
      title: "Lost & Found Guidelines",
      desc: "Lost & Found postings are strictly for reporting lost items or claiming found items inside Chandigarh University campuses. Falsifying lost reports, posting incorrect claims, or demanding extortionate rewards for recovered student ID cards is strictly prohibited."
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      title: "User Responsibilities",
      desc: "You are solely responsible for actions linked to your verified account. Users must conduct themselves professionally, communicate respectfully inside chats, honor negotiated prices, and provide genuine reviews to build mutual community trust."
    },
    {
      icon: <Ban className="w-5 h-5 text-primary" />,
      title: "Account Suspension Policy",
      desc: "HostelX operations desks run automatic auditing on reviews, chat reports, and unfulfilled bids. Accounts associated with scam listings, severe outbid defaults, harassment, or repeatedly breaking Chandigarh University hostel codes will face permanent bans from the platform."
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

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 z-10 relative flex-grow">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Hero */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Scale className="w-4 h-4" /> Community Code
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Effective: June 1, 2026. Review our official community guidelines, selling policies, dynamic auction parameters, rental collaterals, and platform code values.
          </p>
        </div>

        {/* Legal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((sec, idx) => (
            <div 
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 w-fit">
                  {sec.icon}
                </div>
                <h3 className="font-bold text-base text-foreground">{sec.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Policy Box */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-2">
          <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-650" /> Zero-Tolerance Scam Alert
          </h4>
          <p className="text-sm text-red-800 font-semibold leading-relaxed">
            HostelX is constructed to verify secure student interactions inside Chandigarh University hostels. Falsifying university domains, scamming classmates, or listing fraudulent study mattress items will lead to immediate, irreversible suspension of your profile, with details forwarded to campus authorities.
          </p>
        </div>

      </main>

      {/* Reusable Footer */}
      <Footer />

    </div>
  );
}

