"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Play, Pause, Lock, Send, Copy, Check, 
  Sparkles, User, PenTool, Link as LinkIcon, Home, Sun, Moon 
} from 'lucide-react';

const THEMES = {
  birthday: { id: 'birthday', label: "Birthday", emoji: "🎂", music: "/music/birthday.mp3" },
  anniversary: { id: 'anniversary', label: "Anniversary", emoji: "❤️", music: "/music/romantic.mp3" },
  congrats: { id: 'congrats', label: "Congrats", emoji: "🎉", music: "/music/celebration.mp3" },
  valentinesday: {id: 'valentinesday', label: "Valentine", emoji: "💐", music: "/music/valentine.mp3"},
};

export default function Page() {
  const [formData, setFormData] = useState({ name: '', message: '', theme: 'birthday', pin: '' });
  const [wishId, setWishId] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingTheme, setPlayingTheme] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

 

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // --- Audio Logic ---
  const togglePreview = (themeKey: string) => {
    if (playingTheme === themeKey) {
      audioRef.current?.pause();
      setPlayingTheme(null);
    } else {
      if (audioRef.current) {
        // @ts-ignore
        audioRef.current.src = THEMES[themeKey].music;
        audioRef.current.play().catch(() => toast.error("Music file missing"));
        setPlayingTheme(themeKey);
      }
    }
  };

  const handleGenerate = async () => {
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Please fill in Name and Message");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/wish', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.id) setWishId(data.id);
      if (audioRef.current) audioRef.current.pause();
    } catch {
      toast.error("Failed to create wish");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/wish/${wishId}`);
    setCopied(true);
    toast.success("Link Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setWishId('');
    setFormData({ name: '', message: '', theme: 'birthday', pin: '' });
    setCopied(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 transition-colors duration-500 font-sans selection:bg-indigo-500/30">
      
      {/* Top Bar */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 sm:mb-6 md:mb-10">
         <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="neu-flat p-2 sm:p-3 md:p-4 rounded-xl md:rounded-2xl text-indigo-500 ">
              <Sparkles size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 opacity-80" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-slate-800">WishMaster</h1>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 text-slate-400">Create Magic</p>
            </div>
         </div>
         
      </div>

      <audio ref={audioRef} loop />

      {/* Main Card */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-lg p-4 sm:p-6 md:p-12 neu-flat"
      >
        {!wishId ? (
          <div className="space-y-4 sm:space-y-6 md:space-y-10">
            {/* Vibe Selector */}
            <div className="text-center">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-extrabold uppercase tracking-widest opacity-40 mb-3 sm:mb-4 md:mb-6 ">Select Vibe</p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <div 
                    key={key}
                    onClick={() => setFormData({ ...formData, theme: key })}
                    className={`
                      relative py-2 sm:py-3 md:py-6 rounded-xl sm:rounded-2xl md:rounded-3xl cursor-pointer text-center transition-all border-2 group
                      ${formData.theme === key 
                        ? 'border-indigo-500  neu-pressed' 
                        : 'border-transparent neu-flat hover:-translate-y-1'}
                    `}
                  >
                    <div className="text-xl sm:text-2xl md:text-4xl mb-0.5 sm:mb-1 md:mb-3 filter drop-shadow-sm">{theme.emoji}</div>
                    <p className={`text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-wider truncate px-0.5 sm:px-1 ${formData.theme === key ? 'text-indigo-600 ' : 'opacity-50 '}`}>
                      {theme.label}
                    </p>
                    
                    {/* Play Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePreview(key); }}
                      className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 md:-top-3 md:-right-3 bg-indigo-500 text-white rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg hover:scale-110 transition z-10"
                    >
                      {playingTheme === key ? <Pause size={8} className="sm:w-[10px] sm:h-[10px] md:w-3 md:h-3" fill="currentColor" /> : <Play size={8} className="sm:w-[10px] sm:h-[10px] md:w-3 md:h-3" fill="currentColor" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2 relative">
                <label className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase ml-3 sm:ml-4 opacity-40 ">Recipient</label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-400/60 " />
                  <input 
                    className="w-full p-2.5 pl-9 sm:p-3.5 sm:pl-10 md:p-5 md:pl-14 neu-pressed text-sm sm:text-base md:text-lg font-medium text-slate-700  placeholder:opacity-30 "
                    placeholder="e.g. Sarah"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2 relative">
                <label className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase ml-3 sm:ml-4 opacity-40 ">Message</label>
                <div className="relative">
                  <PenTool className="absolute left-3 sm:left-4 md:left-5 top-3 sm:top-4 md:top-6 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-400/60 d" />
                  <textarea 
                    className="w-full p-2.5 pl-9 sm:p-3.5 sm:pl-10 md:p-5 md:pl-14 neu-pressed text-sm sm:text-base md:text-lg font-medium min-h-[100px] sm:min-h-[120px] md:min-h-[160px] resize-none text-slate-700  placeholder:opacity-30"
                    placeholder="Type your wish here..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5 md:space-y-2 relative">
                 <label className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase ml-3 sm:ml-4 opacity-40 ">Privacy (Optional)</label>
                 <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-400/60 " />
                    <input 
                      type="text"
                      maxLength={4}
                      className="w-full p-2.5 pl-9 sm:p-3.5 sm:pl-10 md:p-5 md:pl-14 neu-pressed font-bold tracking-[0.5em] text-center text-slate-700 bg-[#1A1B1E]"
                      placeholder="PIN"
                      value={formData.pin}
                      onChange={(e) => setFormData({...formData, pin: e.target.value})}
                    />
                 </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl md:rounded-3xl neu-flat neu-btn text-indigo-600 text-sm sm:text-base md:text-lg tracking-widest hover:text-indigo-700 disabled:opacity-50 font-black uppercase"
            >
              {loading ? 'Crafting...' : <span className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3"><Send size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" /> Create Link</span>}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 md:py-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full neu-flat flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 text-green-500 "
            >
              <Check size={24} className="sm:w-8 sm:h-8 md:w-12 md:h-12" strokeWidth={4} />
            </motion.div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1.5 sm:mb-2 text-slate-800 ">It's Ready!</h2>
            <p className="opacity-60 mb-6 sm:mb-8 md:mb-10 text-xs sm:text-sm md:text-base text-slate-600 font-medium">Your wish has been wrapped and sealed.</p>
            
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="neu-pressed p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 overflow-hidden bg-opacity-50 "
            >
               <LinkIcon size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-slate-400 shrink-0" />
               <span className="text-[10px] sm:text-xs md:text-sm opacity-60 truncate flex-1 text-left text-slate-700 font-mono">
                 {`${window.location.origin}/wish/${wishId}`}
               </span>
            </motion.div>

            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
              className="w-full py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl neu-flat neu-btn mb-4 sm:mb-6 font-bold text-slate-700 text-sm sm:text-base md:text-lg"
            >
              {copied ? (
                <span className="flex items-center justify-center gap-1.5 sm:gap-2 text-green-500">
                  <Check size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" /> Copied!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Copy size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" /> Copy Link
                </span>
              )}
            </motion.button>
            
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              onClick={resetForm} 
              className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest opacity-40 hover:opacity-100 text-indigo-500 transition-all flex items-center gap-1.5 sm:gap-2 mx-auto"
            >
              <Home size={12} className="sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 " /> Create Another Wish
            </motion.button>
          </div>
        )}
      </motion.div>
    </main>
  );
}