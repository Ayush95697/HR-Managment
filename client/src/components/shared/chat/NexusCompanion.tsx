import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { playPopSound } from '../../../utils/nexusEffects';

interface NexusCompanionProps {
  isOpen: boolean;
  onOpen: () => void;
  userName: string;
}

const greetings = [
  "How's the workload looking today?",
  "Need a quick summary?",
  "Try asking: 'Show my critical tasks'",
  "What can I help you build today?",
  "Ready to crush those active tasks?"
];

export function NexusCompanion({ isOpen, onOpen, userName }: NexusCompanionProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    // Randomly show a greeting after some time if chat isn't open
    const timer = setTimeout(() => {
      if (!isOpen) {
        const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
        const isFirst = Math.random() > 0.5;
        const msg = isFirst ? `Good ${timeOfDay}, ${userName}! 👋` : greetings[Math.floor(Math.random() * greetings.length)];
        
        setGreetingText(msg);
        setShowGreeting(true);
        playPopSound();
        
        // Hide after 8 seconds
        setTimeout(() => setShowGreeting(false), 8000);
      }
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [isOpen, userName]);

  const handleClick = () => {
    setShowGreeting(false);
    onOpen();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-500`}>
      
      {/* Greeting Bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
            className="bg-[var(--surface-1)]/90 backdrop-blur-md border border-purple-500/30 px-5 py-3.5 rounded-2xl rounded-br-sm shadow-[0_8px_30px_-4px_rgba(168,85,247,0.3)] cursor-pointer group"
            onClick={handleClick}
          >
            <p className="text-[14px] font-medium text-[var(--text-primary)] flex items-center gap-2.5">
              <Sparkles size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              {greetingText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Avatar Mascot */}
      <motion.button
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        className="relative w-16 h-16 flex items-center justify-center group focus:outline-none"
        aria-label="Wake up Nexus"
      >
        {/* Dynamic Shadow underneath */}
        <motion.div 
           animate={{ scale: [1, 0.8, 1], opacity: [0.4, 0.15, 0.4] }}
           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -bottom-6 w-10 h-2 bg-black/60 rounded-[100%] blur-sm pointer-events-none"
        />

        {/* Main Body */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_30px_rgba(168,85,247,0.5)] overflow-hidden transition-all duration-300 ${isOpen ? 'ring-4 ring-purple-500/30' : ''}`}>
          {/* Glass glare */}
          <div className="absolute top-1 left-2 w-10 h-6 bg-white/20 rounded-full rotate-[-45deg] blur-sm pointer-events-none" />
        </div>

        {/* Face / Eye Container */}
        <motion.div 
           animate={isHovered ? { scale: 1.1, rotate: [0, -15, 15, -15, 0] } : { scale: [1, 1.03, 1] }}
           transition={isHovered ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
           className="relative z-10 text-white flex flex-col items-center pointer-events-none"
        >
          {/* SVG Robot Face with Blinking Animation */}
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="32" height="20" rx="6" fill="rgba(0,0,0,0.3)" />
            {/* Left Eye */}
            <motion.rect 
              animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '50% 50%' }}
              x="12" y="16" width="5" height="8" rx="2.5" fill="#E9D5FF" className="drop-shadow-[0_0_5px_rgba(233,213,255,1)]" 
            />
            {/* Right Eye */}
            <motion.rect 
              animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 0.05 }}
              style={{ transformOrigin: '50% 50%' }}
              x="23" y="16" width="5" height="8" rx="2.5" fill="#E9D5FF" className="drop-shadow-[0_0_5px_rgba(233,213,255,1)]" 
            />
          </svg>
        </motion.div>
        
        {/* Orbiting Tech Rings */}
        <motion.div 
          animate={{ rotate: 360, scale: isHovered || isOpen ? 1.15 : 1 }}
          transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 0.3 } }}
          className="absolute inset-[-5px] border-t-2 border-l-2 border-purple-300/50 rounded-full pointer-events-none"
        />
        <motion.div 
          animate={{ rotate: -360, scale: isHovered || isOpen ? 1.15 : 1 }}
          transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 0.3 } }}
          className="absolute inset-[-10px] border-b-2 border-r-2 border-indigo-400/40 rounded-full pointer-events-none"
        />
      </motion.button>
    </div>
  );
}
