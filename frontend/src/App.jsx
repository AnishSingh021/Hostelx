import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SellItemPage from './pages/SellItemPage';
import Marketplace from './pages/Marketplace';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/AdminDashboard';
import MyListingsPage from './pages/MyListingsPage';
import EditItemPage from './pages/EditItemPage';
import SavedItemsPage from './pages/SavedItemsPage';
import FashionRentalPage from './pages/FashionRentalPage';
import AuctionsPage from './pages/AuctionsPage';
import NearbyPage from './pages/NearbyPage';
import RoommateEssentialsPage from './pages/RoommateEssentialsPage';
import LostAndFoundPage from './pages/LostAndFoundPage';
import SemesterExitSalePage from './pages/SemesterExitSalePage';
import TemporaryRentalsPage from './pages/TemporaryRentalsPage';

// Scroll to top on every route navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/auth" replace />;

  if (!user.college || !user.hostel) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user && user.college && user.hostel) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellItemPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-item/:id"
            element={
              <ProtectedRoute>
                <EditItemPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedItemsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fashion"
            element={
              <ProtectedRoute>
                <FashionRentalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auctions"
            element={
              <ProtectedRoute>
                <AuctionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nearby"
            element={
              <ProtectedRoute>
                <NearbyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roommate-essentials"
            element={
              <ProtectedRoute>
                <RoommateEssentialsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lost-found"
            element={
              <ProtectedRoute>
                <LostAndFoundPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exit-sale"
            element={
              <ProtectedRoute>
                <SemesterExitSalePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <TemporaryRentalsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;