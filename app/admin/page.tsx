"use client";
import { useState, useEffect, useCallback } from 'react';
import { 
  Lock, Trash2, Search, RefreshCcw, LogOut, LayoutDashboard, 
  Gift, Eye, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';

interface Wish {
  _id: string;
  name: string;
  message: string;
  theme: string;
  pin: string | null;
  views: number;
  createdAt: string;
}

export default function AdminPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ⚠️ CHANGE THIS PASSWORD FOR PRODUCTION
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; 

  const fetchWishes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/get-all'); 
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWishes(data);
    } catch (error) {
      toast.error("Could not load wishes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchWishes();
  }, [isAuthenticated, fetchWishes]);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
      toast.success("Welcome Admin");
    } else {
      toast.error("Wrong Password");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Permanently delete this wish?")) return;
    
    // Optimistic UI update
    setWishes(prev => prev.filter((w) => w._id !== id));
    toast.success("Wish deleted");
    
    try {
      await fetch('/api/admin/delete', { 
        method: 'POST', 
        body: JSON.stringify({ id }) 
      });
    } catch (error) {
      toast.error("Server error");
      fetchWishes(); // Revert if failed
    }
  };

  const handleViewWish = (id: string) => {
    window.open(`/wish/${id}`, '_blank');
  };

  const filteredWishes = wishes.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: wishes.length,
    views: wishes.reduce((acc, curr) => acc + (curr.views || 0), 0),
    locked: wishes.filter(w => w.pin).length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-4">
        <div className="w-full max-w-[90%] sm:max-w-sm p-6 sm:p-8 md:p-10 bg-white rounded-2xl sm:rounded-[25px] md:rounded-[30px] shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-indigo-600">
            <Lock size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-800">Admin Portal</h1>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <input 
              type="password" 
              placeholder="Enter Password"
              className="w-full p-3 sm:p-4 bg-slate-50 rounded-xl text-center tracking-widest outline-none border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 text-sm sm:text-base" 
              onChange={(e) => setPassword(e.target.value)} 
              value={password}
            />
            <button type="submit" className="w-full py-3 sm:py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:scale-98 transition-all text-sm sm:text-base shadow-lg shadow-indigo-200">
              UNLOCK
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-4 md:p-8 font-sans text-slate-700">
      {/* Navbar */}
      <nav className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center mb-4 sm:mb-6 md:mb-8 sticky top-2 sm:top-4 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-indigo-50 p-1.5 sm:p-2 rounded-lg text-indigo-600">
            <LayoutDashboard size={16} className="sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight text-slate-800">
            <span className="hidden xs:inline">WishMaster </span>
            <span className="text-indigo-600">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button onClick={fetchWishes} className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-full transition text-slate-500 hover:text-slate-700">
            <RefreshCcw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition">
            <LogOut size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <StatCard icon={<Gift className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500"/>} label="Total Wishes" value={stats.total} />
        <StatCard icon={<Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"/>} label="Total Views" value={stats.views} />
        <StatCard icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500"/>} label="Protected" value={stats.locked} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-[30px] shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-64 md:w-96">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-slate-50 rounded-lg sm:rounded-xl outline-none text-xs sm:text-sm border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-bold text-center sm:text-left">{filteredWishes.length} Found</span>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {filteredWishes.map((wish) => (
            <div key={wish._id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm mb-1">To: {wish.name}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {new Date(wish.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleViewWish(wish._id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <ExternalLink size={16} />
                  </button>
                  <button onClick={() => handleDelete(wish._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 mb-2 line-clamp-2">{wish.message}</p>
              
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white border border-slate-200 text-slate-600 uppercase">
                  {wish.theme}
                </span>
                <span className="text-xs font-mono text-indigo-600 font-bold">👁️ {wish.views || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">To</th>
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Message</th>
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Theme</th>
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Views</th>
                <th className="p-3 lg:p-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredWishes.map((wish) => (
                <tr key={wish._id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="p-3 lg:p-4 text-xs text-slate-500 font-mono">
                    {new Date(wish.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 lg:p-4 font-bold text-slate-800 text-sm">{wish.name}</td>
                  <td className="p-3 lg:p-4 text-sm text-slate-600 truncate max-w-xs">{wish.message}</td>
                  <td className="p-3 lg:p-4 text-center">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 uppercase">
                      {wish.theme}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4 text-center font-mono text-sm text-indigo-600 font-bold">{wish.views || 0}</td>
                  <td className="p-3 lg:p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleViewWish(wish._id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </button>
                      <button onClick={() => handleDelete(wish._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredWishes.length === 0 && (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-slate-400">
              <Gift size={28} className="sm:w-8 sm:h-8" />
            </div>
            <p className="text-slate-500 font-bold text-sm sm:text-base">No wishes found</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 hover:shadow-md transition-shadow">
      <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-slate-50 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}