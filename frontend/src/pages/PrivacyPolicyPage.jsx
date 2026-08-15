import { useState } from 'react';
import { ShieldCheck, Mail, ArrowLeft, Database, MapPin, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();

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
            <ShieldCheck className="w-4 h-4" /> Trust & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Last Updated: June 1, 2026. HostelX is committed to safeguarding the trust and data of Chandigarh University hostellers. Learn about how we handle data collections, authorization systems, location trackers, and user storage assets.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8 font-medium">
          
          {/* Card 1: Data Collection */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Data Collection</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We collect information to facilitate safe, trusted transactions within Chandigarh University hostels. This includes your name, institutional email address, details regarding listings you post, and metadata about completed QR-code trust handovers.
            </p>
          </div>

          {/* Card 2: Firebase Auth Usage */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Firebase Authentication</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We utilize official Firebase Authentication to register and sign in users securely. Firebase Auth handles passwords, multi-factor logins, and email-verification links. Under no circumstances do our servers read, store, or transmit your account passwords.
            </p>
          </div>

          {/* Card 3: Location / GPS Usage */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Location and GPS Usage</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              HostelX leverages browser-level GPS/Geolocation APIs to power our Smart Nearby Radar, calculating estimated walking time estimates and walking radii between sellers. We only fetch your current location when the Radar is active. This location data is processed locally inside your browser and is never tracked continuously or stored persistently on backend servers.
            </p>
          </div>

          {/* Card 4: User Data Storage */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">User Data Storage</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All profile configurations, product descriptions, listing images, bid histories, and chat logs are stored securely using MongoDB Atlas database nodes. Access is governed by strict cloud authorization protocols, preventing external queries or unauthenticated data dumps.
            </p>
          </div>

          {/* Contact Section - Redesigned Inquiries Card */}
          <div className="bg-card border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-foreground">Have Privacy Inquiries?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Have questions about your account, data privacy, or platform policies? Feel free to contact our support team.
              </p>
            </div>
            <div className="pt-2">
              <a 
                href="mailto:anishsingh10121@gmail.com"
                className="saas-btn-primary py-3 px-5 text-xs inline-flex items-center gap-2 cursor-pointer w-fit"
              >
                <Mail className="w-4 h-4" /> Contact Support
              </a>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

