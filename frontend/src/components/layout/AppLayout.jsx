import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, Package, Bell, MessageSquare, Menu, ChevronRight } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Generate breadcrumbs from pathname
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">HostelX</span>
            </Link>

            {/* Global Breadcrumbs (Hide on Dashboard) */}
            {location.pathname !== '/dashboard' && (
              <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground transition-colors">Home</Link>
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathnames.length - 1;
                  const label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');
                  return (
                    <div key={to} className="flex items-center space-x-1">
                      <ChevronRight className="w-4 h-4" />
                      {isLast ? (
                        <span className="text-foreground font-semibold">{label}</span>
                      ) : (
                        <Link to={to} className="hover:text-foreground transition-colors">{label}</Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3">
              Marketplace
            </Link>
            <Link to="/chat" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors relative">
              <MessageSquare className="w-5 h-5" />
            </Link>
            <div className="h-5 w-px bg-border mx-1"></div>
            
            <div className="flex items-center gap-2 pl-1">
              <img 
                src={user?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
              <button 
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full relative">
        {children}
      </main>
    </div>
  );
}

