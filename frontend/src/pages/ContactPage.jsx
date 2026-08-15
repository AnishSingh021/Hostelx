import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, User, FileText, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    
    // Simulate API Submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData(prev => ({ ...prev, message: '' }));
    }, 1200);
  };

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
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Mail className="w-4 h-4" /> Support Form
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Contact Support
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Have listing disputes? Need help with QR-code scans or platform boosts? File a support ticket directly. Our Chandigarh University helpdesk settles tickets within 12 hours.
          </p>
        </div>

        {/* Form & Sidebar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Support Form Card (Left Col) */}
          <div className="md:col-span-3 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            {success ? (
              <div className="text-center py-12 space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Ticket Filed Successfully!</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm leading-relaxed">
                  We've received your inquiry! A campus operations specialist will inspect your query details and follow up via email within 12 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 saas-btn-primary px-6 py-2.5 text-xs"
                >
                  File another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anish Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="saas-input pl-10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. anish@google.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="saas-input pl-10"
                    />
                  </div>
                </div>

                {/* Topic Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Support Subject</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="saas-input pl-10 pr-10 cursor-pointer appearance-none"
                    >
                      <option value="General Inquiry">General Inquiry / Feedback</option>
                      <option value="Listing Disputes">Product Listing Dispute</option>
                      <option value="QR-Code Errors">QR-Code Scanner Issues</option>
                      <option value="Billing / Credit Boosts">Boost Credits Balance</option>
                      <option value="Scam Alert">Reporting Abuse or Scam</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-t-[#64748B] border-l-transparent border-r-transparent w-0 h-0" />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Support Details *</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Describe listing IDs, transaction dates, or details of your technical issues..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="saas-input resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full saas-btn-primary py-3.5 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

          {/* Guidelines Sidebar (Right Col) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Guidelines Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" /> Ticket Guidelines
              </h3>
              <ul className="text-xs text-muted-foreground space-y-3 font-semibold leading-relaxed">
                <li>💡 <strong className="text-foreground font-bold">Be Specific:</strong> Include direct product names and seller names inside your text.</li>
                <li>🖼️ <strong className="text-foreground font-bold">Provide Evidence:</strong> In case of transactional disputes, retain screenshots of chats.</li>
                <li>📧 <strong className="text-foreground font-bold">Email Communications:</strong> Support replies will arrive directly at your verified login email.</li>
              </ul>
            </div>

            {/* Direct Contact Card (Contact HostelX) */}
            <div className="bg-card border border-primary/20 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Direct Inquiry</p>
                <h4 className="font-bold text-base text-foreground">Contact Support Desk</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Have questions, found a bug, or want to suggest custom additions?
                </p>
              </div>
              
              <div className="space-y-4 pt-1">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Support Email</span>
                  <a 
                    href="mailto:anishsingh10121@gmail.com"
                    className="saas-btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" /> anishsingh10121@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

