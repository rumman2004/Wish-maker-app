"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Play, Pause, Lock, Unlock } from 'lucide-react';

// --- Types ---
type ThemeType = 'birthday' | 'anniversary' | 'congrats' | 'valentinesday';

interface WishProps {
  wish: {
    name: string;
    message: string;
    theme: string;
    pin: string | null;
  };
}

interface Flower {
  id: number;
  x: number;
  baseHeight: number;
  petalColor: string;
  centerColor: string;
  stemCurve: number;
  swayDelay: number;
}

// --- Rose color palette ---
const ROSE_COLORS = [
  { petal: "#FF1744", center: "#880E4F" }, // Deep Red
  { petal: "#EC407A", center: "#AD1457" }, // Pink
  { petal: "#F48FB1", center: "#C2185B" }, // Light Pink
  { petal: "#FF6F00", center: "#E65100" }, // Orange
  { petal: "#FFD54F", center: "#F57F17" }, // Yellow
  { petal: "#BA68C8", center: "#7B1FA2" }, // Purple
  { petal: "#FF80AB", center: "#C51162" }, // Hot Pink
  { petal: "#FFAB91", center: "#D84315" }, // Peach
  { petal: "#E1BEE7", center: "#8E24AA" }, // Lavender
  { petal: "#F06292", center: "#AD1457" }, // Rose Pink
];

// --- Constants ---
const THEMES = {
  birthday: { 
    id: 'birthday',
    color: "text-pink-400 drop-shadow-sm", 
    flowerColors: ["#E879F9", "#D946EF", "#C026D3", "#A21CAF"], 
    colors: ROSE_COLORS, 
    emoji: "🎂", 
    music: "/music/birthday.mp3" 
  },
  anniversary: { 
    id: 'anniversary',
    color: "text-red-400 drop-shadow-sm", 
    flowerColors: ["#F87171", "#EF4444", "#DC2626", "#B91C1C"], 
    colors: ROSE_COLORS,
    emoji: "💑", 
    music: "/music/romantic.mp3" 
  },
  congrats: { 
    id: 'congrats',
    color: "text-teal-400 drop-shadow-sm", 
    flowerColors: ["#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488"], 
    colors: ROSE_COLORS,
    emoji: "🎉", 
    music: "/music/celebration.mp3" 
  },
  valentinesday: { 
    id: 'valentinesday',
    color: "text-rose-400 drop-shadow-sm", 
    emoji: "🌺", 
    music: "/music/valentine.mp3",
    flowerColors: ["#E11D48", "#BE123C", "#FB7185", "#F43F5E"], 
    colors: [
      { petal: "#D50000", center: "#5D1010" }, 
      { petal: "#FF1744", center: "#880E4F" }, 
      { petal: "#F50057", center: "#880E4F" }, 
    ] 
  },
};

// --- Glass Styles ---
const glassCardStyle = "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-[24px] md:rounded-[30px]";
const glassInputStyle = "bg-black/10 shadow-inner border border-white/10 focus:border-white/30 text-slate-600 placeholder:text-slate-400";
const glassButtonStyle = "bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg text-purple-600 transition-all duration-300";
const insetGlassStyle = "bg-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-white/5 rounded-2xl";
const mainBackgroundStyle = "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900";

export default function WishDisplay({ wish }: WishProps) {
  const [locked, setLocked] = useState(!!wish.pin);
  const [inputPin, setInputPin] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const themeKey = (wish.theme as ThemeType) || 'birthday';
  const theme = THEMES[themeKey] || THEMES.birthday;

  // --- Auto-Play Logic ---
  const attemptPlay = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => console.log("Autoplay waiting for interaction"));
    }
  };

  useEffect(() => {
    if (!locked) {
      attemptPlay();
      const startAudioOnInteraction = () => {
        attemptPlay();
        document.removeEventListener('click', startAudioOnInteraction);
      };
      document.addEventListener('click', startAudioOnInteraction);
      return () => document.removeEventListener('click', startAudioOnInteraction);
    }
  }, [locked]);

  // --- Actions ---
  const unlock = () => {
    if (inputPin === wish.pin) {
      setLocked(false);
      triggerConfetti();
      setTimeout(attemptPlay, 100);
    } else {
      alert("Incorrect PIN");
    }
  };

  const triggerConfetti = () => {
    confetti({ 
      particleCount: 150, 
      spread: 120, 
      origin: { y: 0.6 },
      colors: theme.flowerColors,
      scalar: 1.1,
      drift: 0.2,
    });
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => console.log("Audio playback failed"));
      setIsPlaying(true);
    }
  };

  // --- Rose Generation ---
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) attemptPlay();

    const target = e.target as HTMLElement;
    // Don't spawn flowers if clicking buttons or inputs
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('.wish-card')) {
      return;
    }

    const availableColors = theme.colors;
    const colorPalette = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // Adjusted heights: Much taller for mobile
    const isMobile = window.innerWidth < 640;
    const height = isMobile 
      ? 260 + Math.random() * 120  // Mobile: 260px - 380px (Significantly taller)
      : 220 + Math.random() * 130; // Desktop/Tablet: Unchanged

    const newFlower: Flower = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      baseHeight: height,
      petalColor: colorPalette.petal,
      centerColor: colorPalette.center,
      stemCurve: -20 + Math.random() * 40,
      swayDelay: Math.random() * 2,
    };
    
    setFlowers((prev) => [...prev, newFlower]);

    // Flowers fade out after 10s
    setTimeout(() => {
      setFlowers((prev) => prev.filter((f) => f.id !== newFlower.id));
    }, 10000);
  };

  useEffect(() => {
    if (!wish.pin) {
      setTimeout(triggerConfetti, 300);
    }
  }, [wish.pin]);

  // --- Render: Locked State ---
  if (locked) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${mainBackgroundStyle}`}>
        <audio ref={audioRef} src={theme.music} loop /> 
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-[90%] md:max-w-sm p-8 text-center ${glassCardStyle}`}
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 text-blue-900"
          >
            <Lock className="w-6 h-6 md:w-8 md:h-8" />
          </motion.div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-blue-700">Protected Wish</h2>
          
          <input 
            type="password" 
            maxLength={4}
            className={`w-full p-4 mb-6 text-center tracking-[1em] text-xl font-bold outline-none rounded-xl ${glassInputStyle}`}
            placeholder="••••"
            onChange={(e) => setInputPin(e.target.value)}
          />
          
          <button onClick={unlock} className={`w-full py-4 rounded-xl font-bold text-sm uppercase ${glassButtonStyle}`}>
            Unlock Wish
          </button>
        </motion.div>
      </div>
    );
  }

  // --- Render: Unlocked Wish ---
  return (
    <div 
      onClick={handleScreenClick}
      // Layout: Top-aligned on mobile (pt-14) to leave room for flowers at bottom
      className={`min-h-screen flex flex-col items-center justify-start pt-18 md:justify-center md:pt-0 p-4 relative overflow-hidden ${mainBackgroundStyle}`}
      style={{ cursor: 'pointer' }}
    >
      <audio ref={audioRef} src={theme.music} loop />

      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic} 
          className={`p-3 rounded-full ${glassButtonStyle}`}
        >
           {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
         </motion.button>
      </div>

      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className={`wish-card relative z-20 w-full max-w-[95%] sm:max-w-lg md:max-w-xl p-5 sm:p-8 md:p-12 text-center ${glassCardStyle}`}
      >
        <div className="text-5xl sm:text-6xl md:text-8xl mb-3 sm:mb-6 animate-bounce">
          {theme.emoji}
        </div>
        
        <h1 className={`text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 ${theme.color} tracking-tight`}>
          For {wish.name}
        </h1>
        
        <div className={`relative p-4 sm:p-6 min-h-[100px] flex items-center justify-center ${insetGlassStyle}`}>
          <p className="text-base sm:text-xl md:text-2xl text-pink-600 italic font-medium leading-relaxed">
            &ldquo;{wish.message}&rdquo;
          </p>
        </div>
        
        <div className="mt-4 sm:mt-8 text-[10px] sm:text-xs text-purple-500 uppercase tracking-[0.2em] font-bold">
          Tap below to bloom roses 🌹
        </div>
      </motion.div>

      {/* Rose Garden Layer */}
      <AnimatePresence mode="popLayout">
        {flowers.map((flower) => (
          <RoseComponent key={flower.id} flower={flower} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Animated Growing Rose Component ---
function RoseComponent({ flower }: { flower: Flower }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const flowerWidth = isMobile ? 70 : 100;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.5, y: 20 }}
      transition={{ opacity: { duration: 0.5 } }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: flower.x,
        transform: 'translateX(-50%)',
        height: `${flower.baseHeight}px`,
        width: `${flowerWidth}px`,
        zIndex: 10,
        pointerEvents: 'none',
        transformOrigin: 'bottom center',
        filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' 
      }}
    >
      <motion.div
        // Sway animation (Wind effect)
        animate={{ rotate: [0, 1.5, -1.5, 0], x: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: flower.swayDelay }}
        style={{ width: '100%', height: '100%', transformOrigin: 'bottom center' }}
      >
        <svg width={flowerWidth} height={flower.baseHeight} viewBox={`0 0 120 ${flower.baseHeight}`} style={{ overflow: 'visible' }}>
          {/* 1. Growing Stem */}
          <motion.path 
            d={`M 60 ${flower.baseHeight} Q ${60 + flower.stemCurve} ${flower.baseHeight * 0.5} 60 35`} 
            stroke="#2F7C31" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* 2. Leaves - Pop out with FIXED Alignment */}
          {/* Left Leaf */}
          <motion.g 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            style={{ transformOrigin: `60px ${flower.baseHeight * 0.6}px` }}
          >
             <path d={`M 60 ${flower.baseHeight * 0.6} Q 40 ${flower.baseHeight * 0.55} 30 ${flower.baseHeight * 0.5}`} stroke="#2F7C31" strokeWidth="2" fill="none" />
             <ellipse 
                cx="30" 
                cy={flower.baseHeight * 0.5} 
                rx="8" 
                ry="12" 
                fill="#4CAF50" 
                transform={`rotate(-30 30 ${flower.baseHeight * 0.5})`} 
             />
          </motion.g>

          {/* Right Leaf */}
          <motion.g 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
            style={{ transformOrigin: `60px ${flower.baseHeight * 0.45}px` }}
          >
             <path d={`M 60 ${flower.baseHeight * 0.45} Q 80 ${flower.baseHeight * 0.4} 90 ${flower.baseHeight * 0.35}`} stroke="#2F7C31" strokeWidth="2" fill="none" />
             <ellipse 
                cx="90" 
                cy={flower.baseHeight * 0.35} 
                rx="8" 
                ry="12" 
                fill="#4CAF50" 
                transform={`rotate(30 90 ${flower.baseHeight * 0.35})`} 
             />
          </motion.g>

          {/* 3. Flower Head - Blooms last */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8, type: "spring", bounce: 0.5 }}
            style={{ transformOrigin: "60px 30px" }}
          >
             {[0, 60, 120, 180, 240, 300].map((angle, i) => (
               <ellipse key={i} cx="60" cy="30" rx="12" ry="18" fill={flower.petalColor} transform={`rotate(${angle} 60 30)`} />
             ))}
             <circle cx="60" cy="30" r="5" fill={flower.centerColor} />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}