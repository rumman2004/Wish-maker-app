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

// --- Constants with Light Theme ---
const THEMES = {
  birthday: { 
    id: 'birthday',
    color: "text-pink-600 drop-shadow-sm", 
    bgGradient: "from-pink-50 via-purple-50 to-blue-50",
    flowerColors: ["#E879F9", "#D946EF", "#C026D3", "#A21CAF"], 
    emoji: "🎂", 
    music: "/music/birthday.mp3" 
  },
  anniversary: { 
    id: 'anniversary',
    color: "text-red-600 drop-shadow-sm", 
    bgGradient: "from-red-50 via-pink-50 to-rose-50",
    flowerColors: ["#F87171", "#EF4444", "#DC2626", "#B91C1C"], 
    emoji: "💑", 
    music: "/music/romantic.mp3" 
  },
  congrats: { 
    id: 'congrats',
    color: "text-teal-600 drop-shadow-sm", 
    bgGradient: "from-teal-50 via-cyan-50 to-sky-50",
    flowerColors: ["#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488"], 
    emoji: "🎉", 
    music: "/music/celebration.mp3" 
  },
  valentinesday: { 
    color: "text-rose-600 drop-shadow-sm", 
    bgGradient: "from-rose-50 via-pink-50 to-red-50",
    emoji: "🌺", 
    music: "/music/valentine.mp3",
    colors: [
      { petal: "#D50000", center: "#5D1010" }, 
      { petal: "#FF1744", center: "#880E4F" }, 
      { petal: "#F50057", center: "#880E4F" }, 
    ] 
  },
};

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
        .catch((e) => console.log("Autoplay blocked by browser - waiting for interaction"));
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
      particleCount: 200, 
      spread: 150, 
      origin: { y: 0.6 },
      colors: theme.flowerColors,
      scalar: 1.2,
      drift: 0.5,
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

  // --- Rose Generation (IMPROVED FOR VISIBILITY) ---
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying) attemptPlay();

    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('.wish-card')) {
      return;
    }

    const availableColors = theme.colors || ROSE_COLORS;
    const colorPalette = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // Much taller flowers for better visibility
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    const height = isMobile 
      ? 220 + Math.random() * 120  // Mobile: 220-340px
      : isTablet 
      ? 260 + Math.random() * 140  // Tablet: 260-400px
      : 300 + Math.random() * 150; // Desktop: 300-450px

    const newFlower: Flower = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      baseHeight: height,
      petalColor: colorPalette.petal,
      centerColor: colorPalette.center,
      stemCurve: -30 + Math.random() * 60,
      swayDelay: Math.random() * 1.5,
    };
    
    setFlowers((prev) => [...prev, newFlower]);

    setTimeout(() => {
      setFlowers((prev) => prev.filter((f) => f.id !== newFlower.id));
    }, 15000);
  };

  useEffect(() => {
    if (!wish.pin) {
      setTimeout(triggerConfetti, 300);
    }
  }, [wish.pin]);

  // --- Render: Locked State ---
  if (locked) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br ${theme.bgGradient}`}>
        <audio ref={audioRef} src={theme.music} loop /> 
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-full max-w-[90%] sm:max-w-[85%] md:max-w-sm p-6 sm:p-8 text-center bg-white rounded-2xl sm:rounded-[25px] md:rounded-[30px] shadow-2xl border border-slate-200"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-slate-700 shadow-lg"
          >
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-slate-800">Protected Wish</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 sm:mb-8 font-medium">Enter the secret PIN to unlock magic</p>
          
          <input 
            type="password" 
            maxLength={4}
            className="w-full p-4 sm:p-5 mb-6 sm:mb-8 text-center tracking-[1.2em] sm:tracking-[1.5em] text-xl sm:text-2xl font-bold outline-none rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-slate-800 transition-all"
            placeholder="••••"
            onChange={(e) => setInputPin(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && unlock()}
          />
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={unlock} 
            className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg tracking-wider uppercase bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all"
          >
            <Unlock size={18} className="sm:w-5 sm:h-5 inline mr-2 sm:mr-3 -mt-1" /> Unlock Wish
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // --- Render: Unlocked Wish ---
  return (
    <div 
      onClick={handleScreenClick}
      className={`relative min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden cursor-pointer bg-gradient-to-br ${theme.bgGradient}`}
    >
      <audio ref={audioRef} src={theme.music} loop />
      
      {/* Music Toggle */}
      <motion.button 
        onClick={toggleMusic}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-700 shadow-xl transition-all"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ml-0.5" fill="currentColor" />
        )}
      </motion.button>

      {/* Main Wish Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        className="wish-card relative z-20 w-full max-w-[95%] sm:max-w-2xl md:max-w-3xl p-6 sm:p-8 md:p-12 text-center bg-white rounded-2xl sm:rounded-[25px] md:rounded-[30px] shadow-2xl border border-slate-200"
      >
        <motion.div 
          animate={{
            y: [0, -8, 0],
            rotate: [0, -2, 2, -2, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl sm:text-5xl md:text-8xl mb-3 sm:mb-4 md:mb-8 filter drop-shadow-lg"
        >
          {theme.emoji}
        </motion.div>
        
        <h1 className={`text-2xl sm:text-3xl md:text-6xl font-black mb-4 sm:mb-6 md:mb-8 ${theme.color} tracking-tight leading-tight`}>
          For {wish.name}
        </h1>
        
        <div className="relative p-4 sm:p-6 md:p-8 min-h-[100px] sm:min-h-[120px] md:min-h-[160px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl shadow-inner">
          <p className="text-base sm:text-lg md:text-3xl text-slate-800 leading-relaxed font-medium italic">
            &ldquo;{wish.message}&rdquo;
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 sm:mt-6 md:mt-10 text-[9px] sm:text-[10px] md:text-sm text-slate-600 uppercase tracking-[0.3em] sm:tracking-[0.4em] font-extrabold"
        >
          Tap anywhere to bloom roses 🌹✨
        </motion.div>
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

// --- Beautiful Rose Component ---
function RoseComponent({ flower }: { flower: Flower }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const flowerWidth = isMobile ? 90 : 110;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.7 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1,
        rotate: [0, 2, -1.5, 2, 0],
        x: [0, 3, -2, 3, 0],
      }}
      exit={{ opacity: 0, scale: 0.6, y: 40 }}
      transition={{ 
        opacity: { duration: 1 },
        y: { duration: 1.4, type: "spring", stiffness: 80 },
        scale: { duration: 1.2 },
        rotate: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: flower.swayDelay },
        x: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: flower.swayDelay },
      }}
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
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
      }}
    >
      <svg 
        width={flowerWidth} 
        height={flower.baseHeight}
        viewBox={`0 0 ${flowerWidth + 20} ${flower.baseHeight}`}
        style={{ overflow: 'visible' }}
      >
        {/* Stem */}
        <motion.path
          d={`M 60 ${flower.baseHeight} Q ${60 + flower.stemCurve} ${flower.baseHeight * 0.5} 60 35`}
          stroke="#2F7C31"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />

        {/* Thorns */}
        {[0.25, 0.45, 0.65, 0.8].map((position, index) => {
          const y = flower.baseHeight - (flower.baseHeight * position);
          const side = index % 2 === 0 ? 1 : -1;
          const thornX = 60 + (side * 5);
          
          return (
            <motion.path
              key={`thorn-${index}`}
              d={`M ${60} ${y} L ${thornX} ${y - 7}`}
              stroke="#2F7C31"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.9 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
            />
          );
        })}

        {/* Leaves */}
        {[0.4, 0.6].map((position, index) => {
          const y = flower.baseHeight - (flower.baseHeight * position);
          const side = index % 2 === 0 ? -1 : 1;
          const leafX = 60 + (side * 20);
          
          return (
            <motion.g key={`leaf-${index}`}>
              <motion.path
                d={`M 60 ${y} Q ${60 + side * 12} ${y - 6} ${leafX} ${y - 10}`}
                stroke="#2F7C31"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
              />
              <motion.ellipse
                cx={leafX}
                cy={y - 10}
                rx="12"
                ry="18"
                fill="#4CAF50"
                opacity="0.95"
                transform={`rotate(${side * 35} ${leafX} ${y - 10})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.95 }}
                transition={{ delay: 1.4 + index * 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
              />
            </motion.g>
          );
        })}

        {/* Rose Bloom */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
        >
          {/* Outer Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => (
            <motion.ellipse
              key={`outer-petal-${index}`}
              cx="60"
              cy="30"
              rx="13"
              ry="20"
              fill={flower.petalColor}
              opacity="0.98"
              transform={`rotate(${angle} 60 30)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.98 }}
              transition={{ delay: 2.2 + index * 0.08, duration: 0.7, type: "spring", bounce: 0.3 }}
            />
          ))}

          {/* Middle Petals */}
          {[30, 90, 150, 210, 270, 330].map((angle, index) => (
            <motion.ellipse
              key={`middle-petal-${index}`}
              cx="60"
              cy="30"
              rx="10"
              ry="16"
              fill={flower.petalColor}
              opacity="0.95"
              transform={`rotate(${angle} 60 30)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.95 }}
              transition={{ delay: 2.5 + index * 0.07, duration: 0.6, type: "spring", bounce: 0.3 }}
            />
          ))}

          {/* Inner Petals */}
          {[0, 72, 144, 216, 288].map((angle, index) => (
            <motion.ellipse
              key={`inner-petal-${index}`}
              cx="60"
              cy="30"
              rx="7"
              ry="11"
              fill={flower.centerColor}
              opacity="0.98"
              transform={`rotate(${angle + 15} 60 30)`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.98 }}
              transition={{ delay: 2.8 + index * 0.06, duration: 0.5, type: "spring", bounce: 0.35 }}
            />
          ))}

          {/* Center */}
          <motion.circle
            cx="60"
            cy="30"
            r="5"
            fill={flower.centerColor}
            opacity="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3.1, duration: 0.3, type: "spring" }}
          />
          <motion.circle
            cx="59"
            cy="28"
            r="2"
            fill="#FFFFFF"
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3.2, duration: 0.2 }}
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}