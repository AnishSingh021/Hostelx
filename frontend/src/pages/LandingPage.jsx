import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';

// Hardcoded particles for background motion
const BACKGROUND_PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 20 + 25,
}));

export default function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Mouse tracker for ambient magnetic shifting of backgrounds
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const x = (clientX / width - 0.5) * 35; // max 35px shift
    const y = (clientY / height - 0.5) * 35;
    setMousePosition({ x, y });
  };

  const letters = ["H", "O", "S", "T", "E", "L"];
  
  // Ghost trail timings for the iconic orbital "X"
  const trailDelays = [0.04, 0.08, 0.12];

  // Letters of HOSTEL - staggered entrance
  const letterVariants = {
    initial: { 
      opacity: 0, 
      x: 350, 
      filter: "blur(12px)",
      scale: 0.7 
    },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 90,
        delay: i * 0.08 + 0.2 // starts at 0.2s, staggered
      }
    })
  };

  // Orbital kinetic path keyframes for X
  const xVariants = {
    initial: {
      x: "100vw",
      y: 0,
      scale: 2.8,
      rotate: 0,
      opacity: 0,
      filter: "blur(6px)"
    },
    animate: {
      x: ["100vw", "-50vw", "-35vw", "0vw", "40vw", "20vw", "0vw"],
      y: [0, -45, 130, 190, 90, -70, 0],
      scale: [2.8, 2.0, 1.3, 1.1, 1.4, 1.6, 1],
      rotate: [0, 360, 540, 720, 900, 1080, 1440],
      opacity: [0, 1, 1, 1, 1, 1, 1],
      filter: ["blur(6px)", "blur(2px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
    }
  };

  const xTransition = {
    duration: 2.2,
    times: [0, 0.18, 0.35, 0.52, 0.68, 0.84, 1.0],
    ease: "easeInOut",
    delay: 1.1 // starts exactly after HOSTEL settles (around 1.1s)
  };

  // Pulse effect on docking completion
  const xPulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.25, 0.95, 1.05, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Slow float loop for the settled elements
  const floatVariants = {
    animate: {
      y: [-6, 6, -6],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen relative w-full bg-[#fcfcfc] dark:bg-[#07090e] text-[#121620] dark:text-[#f3f4f6] flex flex-col justify-between overflow-hidden transition-colors duration-500 font-sans select-none"
    >
      {/* 1. Dynamic Ambient Radial Lighting Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Indigo/Blue top left glow */}
        <motion.div
          animate={{
            x: mousePosition.x * -0.7,
            y: mousePosition.y * -0.7,
          }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent blur-[130px] transition-all"
        />

        {/* Soft Violet/Pink bottom right glow */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.7,
            y: mousePosition.y * 0.7,
          }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/10 via-purple-500/5 to-transparent blur-[130px] transition-all"
        />

        {/* Subtle center background light core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-sky-400/5 dark:bg-sky-400/[0.02] blur-[100px]" />
      </div>

      {/* 2. Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {BACKGROUND_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-blue-500/10 dark:bg-blue-400/5"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -130, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.05, 0.35, 0.05],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3. Top Header Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-ping"></span>
          <span className="font-black text-xs uppercase tracking-[0.2em] text-zinc-900 dark:text-white">HostelX Hub</span>
        </div>
        
        <Link 
          to="/auth" 
          className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </motion.header>

      {/* 4. Central Hero Intro Area */}
      <main className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center justify-center flex-grow z-10 py-12">
        {/* Cinematic Logo Container */}
        <motion.div
          variants={introComplete ? floatVariants : {}}
          animate={introComplete ? "animate" : ""}
          className="relative flex items-center justify-center h-28 sm:h-36 md:h-44"
        >
          <div className="flex items-center font-sans font-black text-6xl sm:text-7xl md:text-8xl select-none text-zinc-900 dark:text-white">
            {/* "H O S T E L" Letter Block */}
            <span className="flex tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.16em]">
              {letters.map((char, idx) => (
                <motion.span
                  key={idx}
                  custom={idx}
                  variants={letterVariants}
                  initial="initial"
                  animate="animate"
                  className="inline-block"
                  style={{ textShadow: "0 0 50px rgba(59, 130, 246, 0.08)" }}
                >
                  {char}
                </motion.span>
              ))}
            </span>

            {/* Futuristic "X" Orbital Wrapper */}
            <span className="relative inline-block ml-3 sm:ml-4 select-none pr-3 sm:pr-4">
              {/* Blur motion trails representing kinetic speed */}
              {!introComplete && trailDelays.map((delay, index) => (
                <motion.span
                  key={index}
                  variants={xVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    ...xTransition,
                    delay: xTransition.delay + delay
                  }}
                  className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 font-black select-none filter pointer-events-none"
                  style={{
                    opacity: 0.45 - index * 0.15,
                    filter: `blur(${(index + 1) * 3}px)`,
                    textShadow: "0 0 35px rgba(59, 130, 246, 0.4)"
                  }}
                >
                  X
                </motion.span>
              ))}

              {/* Main glowing orbital X */}
              <motion.span
                variants={xVariants}
                initial="initial"
                animate="animate"
                transition={xTransition}
                onAnimationComplete={() => setIntroComplete(true)}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 select-none drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]"
              >
                <motion.span
                  variants={xPulseVariants}
                  initial="initial"
                  animate={introComplete ? "pulse" : "initial"}
                  className="inline-block"
                >
                  X
                </motion.span>
              </motion.span>
            </span>
          </div>
        </motion.div>

        {/* Subtitle & CTA Blocks triggered after docking settles */}
        <div className="h-44 sm:h-48 md:h-52 flex flex-col items-center">
          <AnimatePresence>
            {introComplete && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="initial"
                className="space-y-6 flex flex-col items-center"
              >
                {/* Cinematic Subtitle */}
                <motion.p
                  variants={{
                    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
                    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
                  }}
                  className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-md md:max-w-lg leading-relaxed font-semibold"
                >
                  Buy, sell, rent and trade within your hostel community.
                </motion.p>

                {/* Magnetic Hover CTA Wrapper */}
                <motion.div
                  variants={{
                    initial: { opacity: 0, y: 25 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.15 } }
                  }}
                  className="pt-2"
                >
                  <MagneticButton>
                    <Link
                      to="/auth"
                      className="relative group inline-flex items-center gap-2.5 px-8 py-4 bg-zinc-950 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-white text-xs font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-98 transition duration-300 backdrop-blur-md border border-white/10 dark:border-black/5"
                    >
                      Get Started
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="inline-block"
                      >
                        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </motion.span>
                      
                      {/* Gradient border hover highlight */}
                      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 blur-[2px] transition duration-300"></div>
                    </Link>
                  </MagneticButton>
                </motion.div>

                {/* Staggered value feature chips */}
                <motion.div 
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
                  }}
                  className="flex flex-wrap items-center justify-center gap-4.5 pt-4 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                >
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Verified Hostel Access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Direct Meetup Handover</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Built for Hostellers</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 5. Footer Bar */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground z-10 border-t border-zinc-100/50 dark:border-zinc-900/50"
      >
        <span>&copy; {new Date().getFullYear()} HostelX Marketplace Inc.</span>
        <div className="flex gap-4">
          <span>Peer-to-Peer Wardrobe Exchange</span>
          <span>&middot;</span>
          <span>Live Bids Terminal</span>
        </div>
      </motion.footer>
    </div>
  );
}

// Magnetic Button Wrapper for premium tactile hover feedback
function MagneticButton({ children }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Pull intensity factor
    const maxPull = 12;
    const pullX = Math.max(-maxPull, Math.min(maxPull, distanceX * 0.12));
    const pullY = Math.max(-maxPull, Math.min(maxPull, distanceY * 0.12));

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 160, damping: 15, mass: 0.1 }}
      className="inline-block cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
