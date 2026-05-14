import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-primary">
          HostelX
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
          The ultimate marketplace for college and hostel students. Buy, sell, and trade locally.
        </p>
        <Link to="/auth" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg">
          Get Started
        </Link>
      </motion.div>
    </div>
  );
}
