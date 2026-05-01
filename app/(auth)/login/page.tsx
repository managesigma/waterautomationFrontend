'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { 
  Droplets, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Truck, 
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, deploymentType, apiBaseUrl, user } = response.data;

      setAuth({
        jwt: token,
        deploymentType,
        apiBaseUrl,
        userRole: user.role,
        user,
      });

      toast.success('Logged in successfully');
      
      if (user.role === 'SIGMA_ADMIN') router.push('/sigma-admin');
      else if (user.role === 'PMC_ADMIN') router.push('/pmc-admin');
      else if (user.role === 'CONTRACTOR') router.push('/contractor');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex w-full bg-base overflow-hidden font-sans">
      {/* Left Side - Branding & Visuals (split 50%) */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 border-r border-white/10">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400 blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300 blur-[100px]"></div>
        </div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
             <Droplets className="w-6 h-6 text-blue-700" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Sigmatronics</span>
        </div>

        {/* Floating Cards Container */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              {/* Card 1: Operations */}
              <div className="absolute top-0 left-0 w-48 p-4 glass-card border border-white/20 shadow-2xl animate-float-slow">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Fleet Active</span>
                 </div>
                 <p className="text-lg font-bold text-white">42 Trucks</p>
                 <p className="text-[10px] text-white/40">Real-time telemetry</p>
              </div>

              {/* Card 2: Status */}
              <div className="absolute top-1/4 right-0 w-48 p-4 glass-card border border-white/20 shadow-2xl animate-float-medium">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Security</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white uppercase">Protected</span>
                 </div>
              </div>

              {/* Card 3: Performance */}
              <div className="absolute bottom-8 left-1/4 w-52 p-4 glass-card border border-white/20 shadow-2xl animate-float-fast">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Efficiency</span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-amber-400 w-[85%] rounded-full"></div>
                 </div>
              </div>

              {/* Central Visual Hub */}
              <div className="w-20 h-20 bg-blue-500/20 backdrop-blur-3xl rounded-full border border-white/20 flex items-center justify-center">
                 <Zap className="w-10 h-10 text-white opacity-80" />
              </div>
           </div>
        </div>

        {/* Headline Section */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
             Water logistics, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">reimagined.</span>
          </h1>
          <p className="text-blue-100/70 text-sm max-w-xs leading-relaxed">
             Smarter schedules and real-time insights — all in one connected workspace.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form (split 50%) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1c75bc_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="w-full max-w-md z-10 transition-all duration-700">
           <div className="bg-white rounded-[2rem] p-10 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-edge-light">
              <div className="mb-10">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                       <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Partner Portal</span>
                 </div>
                 <h2 className="text-3xl font-bold text-ink mb-2">Welcome back.</h2>
                 <p className="text-ink-muted text-sm">Please enter your credentials to proceed.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest ml-1">Username / Mobile</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-disabled group-focus-within:text-blue-600" />
                       <input
                          required
                          type="text"
                          value={formData.identifier}
                          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                          className="w-full pl-11 pr-4 py-3.5 bg-surface/50 border border-edge-light rounded-xl text-ink text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                          placeholder="muser"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest">Password</label>
                       <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot?</button>
                    </div>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-disabled group-focus-within:text-blue-600" />
                       <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-11 pr-11 py-3.5 bg-surface/50 border border-edge-light rounded-xl text-ink text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                          placeholder="••••••••"
                       />
                       <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-blue-600"
                       >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 px-1">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-edge-light text-blue-600 focus:ring-blue-600/10 cursor-pointer" />
                    <label htmlFor="remember" className="text-[11px] text-ink-secondary font-bold cursor-pointer">Remember me</label>
                 </div>

                 {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                       <AlertCircle className="w-4 h-4 shrink-0" />
                       <p className="text-[10px] font-bold uppercase">{error}</p>
                    </div>
                 )}

                 <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
                 >
                    {loading ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                       <>Sign in</>
                    )}
                 </button>
              </form>
           </div>
           
           <p className="mt-8 text-center text-[10px] text-ink-disabled font-bold uppercase tracking-[0.2em]">© 2026 Sigmatronics Private Ltd</p>
        </div>
      </div>
    </div>
  );
}
