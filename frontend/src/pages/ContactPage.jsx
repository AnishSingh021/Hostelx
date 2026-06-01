import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, User, FileText, Info, Copy, Check, Clock } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('anishsingh10121@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Page Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-550/10 text-xs font-bold tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
            <Mail className="w-4 h-4" /> Support Form
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Contact Support
          </h1>
          <p className="text-sm text-[#475569] dark:text-zinc-300 max-w-2xl leading-relaxed">
            Have listing disputes? Need help with QR-code scans or platform boosts? File a support ticket directly. Our Chandigarh University helpdesk settles tickets within 12 hours.
          </p>
        </div>

        {/* Form & Sidebar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* Support Form Card (Left Col) */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            {success ? (
              <div className="text-center py-12 space-y-4 animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-250 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-[#0F172A] dark:text-white">Ticket Filed Successfully!</h3>
                <p className="text-sm text-[#475569] dark:text-zinc-300 font-semibold max-w-sm leading-relaxed">
                  We've received your inquiry! A campus operations specialist will inspect your query details and follow up via email within 12 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 px-6 py-2.5 bg-[#0F172A] text-white hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  File another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anish Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-xl text-xs font-bold outline-none text-[#0F172A] dark:text-white focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#64748B]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. anish@google.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-xl text-xs font-bold outline-none text-[#0F172A] dark:text-white focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Support Subject</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-[#64748B]" />
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-xl text-xs font-bold outline-none text-[#0F172A] dark:text-white focus:border-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value="General Inquiry">General Inquiry / Feedback</option>
                      <option value="Listing Disputes">Product Listing Dispute</option>
                      <option value="QR-Code Errors">QR-Code Scanner Issues</option>
                      <option value="Billing / Credit Boosts">Boost Credits Balance</option>
                      <option value="Scam Alert">Reporting Abuse or Scam</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-t-[#64748B] border-l-transparent border-r-transparent w-0 h-0" />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Support Details *</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Describe listing IDs, transaction dates, or details of your technical issues..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold outline-none resize-none text-[#0F172A] dark:text-white focus:border-blue-500 transition"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            <div className="bg-white dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" /> Ticket Guidelines
              </h3>
              <ul className="text-xs text-[#475569] dark:text-zinc-300 space-y-3 font-semibold leading-relaxed">
                <li>💡 <strong className="text-[#0F172A] dark:text-white font-bold">Be Specific:</strong> Include direct product names and seller names inside your text.</li>
                <li>🖼️ <strong className="text-[#0F172A] dark:text-white font-bold">Provide Evidence:</strong> In case of transactional disputes, retain screenshots of chats.</li>
                <li>📧 <strong className="text-[#0F172A] dark:text-white font-bold">Email Communications:</strong> Support replies will arrive directly at your verified login email.</li>
              </ul>
            </div>

            {/* Direct Contact Card (Contact HostelX) */}
            <div className="bg-white dark:bg-zinc-950 border-2 border-blue-100 dark:border-blue-900 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-[#0F172A] dark:text-white">Contact HostelX</h4>
                <p className="text-sm text-[#475569] dark:text-zinc-300 font-semibold leading-relaxed">
                  Have feedback, feature suggestions, bug reports, or partnership inquiries?
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Response time: Within 24-48 hours</span>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  <a 
                    href="mailto:anishsingh10121@gmail.com"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-100 dark:border-blue-900 hover:bg-blue-100 transition"
                  >
                    <Mail className="w-4 h-4" /> anishsingh10121@gmail.com
                  </a>
                  
                  <button 
                    onClick={handleCopyEmail}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[#475569] dark:text-zinc-300 font-bold text-xs transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">Email Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Email Address</span>
                      </>
                    )}
                  </button>
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
