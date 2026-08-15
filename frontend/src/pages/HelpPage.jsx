import { useState } from 'react';
import { HelpCircle, ArrowLeft, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function HelpPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How do transactions work on HostelX?",
      a: "All transactions operate peer-to-peer (P2P) locally inside Chandigarh University. Once you discover an item or submit a bidding proposal on the Auction Terminal, you can start a chat directly with the seller. Coordinate a secure meetup block on campus to inspect the product, agree on a price, and perform a hand-to-hand exchange."
    },
    {
      q: "How does the QR-Code verification work?",
      a: "When listing a completed transaction, a secure QR verification card can be displayed in the buyer's app. The seller scans the QR code using their camera capture component. This automatically records the successful peer exchange in the database, rewarding both students with extra Listing Boost credits."
    },
    {
      q: "What are Listing Boost Credits?",
      a: "Boost credits allow listings to be ranked at the absolute top of other searches and proximity radars for 24 hours. Boosted items sell up to 3x faster. Every registered hosteller receives 5 free credits. You can earn extra credits by completing secure QR transactions or maintaining higher seller trust indices."
    },
    {
      q: "How do temporary rentals and deposits operate?",
      a: "Renting is duration-based (daily/weekly). Sellers specify rental collateral inside product listings (such as a refundable cash deposit or student ID card handover). When renting, calculate the cost using our Planner, submit the booking request, chat to coordinate handovers, and return the item on time to recover your collateral."
    },
    {
      q: "How does the Lost & Found Match engine work?",
      a: "When reporting a lost or found item, HostelX uses semantic keyword analysis of your description text. The scanner immediately checks the campus database for potential match overlaps. If an overlap is flagged, you will receive an automatic system notification to review the matching claim details."
    },
    {
      q: "What should I do if a student scams me?",
      a: "Report the student profile immediately via the active peer chat dashboard or email our support operations desk at anishsingh10121@gmail.com. Include product listing IDs and screenshots. We enforce a zero-tolerance policy and ban offenders permanently, sharing details with CU block wardens if necessary."
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
      <main className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16 z-10 relative flex-grow space-y-12">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <HelpCircle className="w-4 h-4" /> Support Desk
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Help Center
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Have questions about student safety, P2P transactions, live auction terminals, or listing boosts? Browse our FAQ index or reach out directly to support specialists.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-6">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-foreground hover:bg-secondary cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground font-medium leading-relaxed border-t border-border">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Support CTA Callout */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-lg text-foreground">Still Need Assistance?</h4>
            <p className="text-xs text-muted-foreground font-medium">
              Our operations desks resolve student ticket queries within 12 hours.
            </p>
          </div>
          <Link 
            to="/contact"
            className="saas-btn-primary px-6 py-3.5 text-xs flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Open Ticket
          </Link>
        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

