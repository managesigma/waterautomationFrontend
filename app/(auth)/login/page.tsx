'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

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
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-1/2 relative flex-col justify-between p-8 xl:p-10 overflow-hidden text-white">
        {/* Animated gradient base */}
        <div
          className="absolute inset-0 animate-aurora"
          style={{
            backgroundImage:
              'linear-gradient(120deg, var(--blue-900) 0%, var(--blue-700) 35%, var(--blue-500) 70%, var(--blue-800) 100%)',
          }}
        />

        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-blue-300/30 blur-[110px] animate-blob" />
          <div className="absolute -bottom-32 -left-20 w-[380px] h-[380px] rounded-full bg-sky-400/25 blur-[120px] animate-blob delay-300" />
          <div className="absolute top-1/3 left-1/4 w-[260px] h-[260px] rounded-full bg-blue-200/20 blur-[90px] animate-blob delay-500" />
        </div>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 animate-fade-up">
          <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center shadow-lg shadow-black/15">
            <WaterDropOutlinedIcon sx={{ fontSize: 20, color: 'var(--blue-700)' }} />
          </div>
          <span className="text-xl font-bold tracking-tight">Sigmatronics</span>
        </div>

        {/* Floating Cards */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-6">
          <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
            {/* Card 1 */}
            <div className="absolute top-0 left-0 w-44 p-3.5 glass-card-flat border border-white/20 shadow-2xl animate-float-slow animate-fade-up delay-100">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_var(--color-sky-400)]" />
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Fleet Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }} />
                <p className="text-base font-bold">42 Trucks</p>
              </div>
              <p className="text-[9px] text-white/40 mt-0.5">Real-time telemetry</p>
            </div>

            {/* Card 2 */}
            <div className="absolute top-1/4 right-0 w-44 p-3.5 glass-card-flat border border-white/20 shadow-2xl animate-float-medium animate-fade-up delay-200">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400)]" />
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: 'var(--color-emerald-400)' }} />
                <span className="text-xs font-bold uppercase tracking-wide">Protected</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="absolute bottom-4 left-1/4 w-48 p-3.5 glass-card-flat border border-white/20 shadow-2xl animate-float-fast animate-fade-up delay-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_var(--color-amber-400)]" />
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Efficiency</span>
                </div>
                <span className="text-[10px] font-bold text-white/80">85%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-amber-400 to-amber-200" />
              </div>
            </div>

            {/* Hub */}
            <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full border border-white/30 flex items-center justify-center shadow-xl animate-fade-in delay-200">
              <BoltOutlinedIcon sx={{ fontSize: 30, color: 'rgba(255,255,255,0.9)' }} />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 animate-fade-up delay-200">
          <h1 className="text-3xl xl:text-4xl font-bold mb-3 leading-tight tracking-tight">
            Water logistics, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
              reimagined.
            </span>
          </h1>
          <p className="text-blue-100/70 text-xs xl:text-sm max-w-xs leading-relaxed">
            Smarter schedules and real-time insights — all in one connected workspace.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white relative overflow-y-auto">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1c75bc_1px,transparent_1px)] [background-size:22px_22px]" />

        {/* Mobile gradient accent */}
        <div className="lg:hidden absolute -top-32 -right-32 w-[320px] h-[320px] rounded-full bg-blue-200/40 blur-[100px] animate-blob pointer-events-none" />
        <div className="lg:hidden absolute -bottom-32 -left-32 w-[320px] h-[320px] rounded-full bg-sky-200/40 blur-[100px] animate-blob delay-300 pointer-events-none" />

        <div className="w-full max-w-sm z-10 animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-600/20">
              <WaterDropOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
            </div>
            <span className="text-xl font-bold text-ink tracking-tight">Sigmatronics</span>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-[0_12px_48px_rgba(15,64,103,0.08)] border border-edge-light">
            {/* Header */}
            <div className="mb-6 animate-fade-up delay-100">
              <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-brand-subtle rounded-full">
                <DashboardOutlinedIcon sx={{ fontSize: 12, color: 'var(--brand)' }} />
                <span className="text-[9px] font-bold text-brand uppercase tracking-widest">Partner Portal</span>
              </div>
              <h2 className="text-2xl font-bold text-ink mb-1">Welcome back.</h2>
              <p className="text-ink-muted text-xs">Please enter your credentials to proceed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier */}
              <div className="space-y-1.5 animate-fade-up delay-200">
                <label className="text-[9px] font-bold text-ink-secondary uppercase tracking-widest ml-1">
                  Username / Mobile
                </label>
                <div className="relative group">
                  <PersonOutlineOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled group-focus-within:text-brand transition-colors"
                    sx={{ fontSize: 18 }}
                  />
                  <input
                    required
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-edge-light rounded-md text-ink text-sm font-medium placeholder:text-ink-disabled focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-brand transition-all"
                    placeholder="muser"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 animate-fade-up delay-300">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold text-ink-secondary uppercase tracking-widest">
                    Password
                  </label>
                  <button type="button" className="text-[9px] font-bold text-brand hover:text-brand-hover transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <LockOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-disabled group-focus-within:text-brand transition-colors"
                    sx={{ fontSize: 18 }}
                  />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2.5 bg-surface border border-edge-light rounded-md text-ink text-sm font-medium placeholder:text-ink-disabled focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-brand transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-brand transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 px-1 animate-fade-up delay-400">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 rounded border-edge-light text-brand focus:ring-blue-600/10 cursor-pointer accent-[var(--brand)]"
                />
                <label htmlFor="remember" className="text-[10px] text-ink-secondary font-bold cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="p-2.5 bg-danger-subtle border border-red-100 rounded-md flex items-center gap-2 text-danger animate-fade-up">
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} className="shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-wide">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-11 overflow-hidden bg-brand hover:bg-brand-hover text-white rounded-md font-bold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed animate-fade-up delay-500 flex items-center justify-center gap-2"
              >
                {/* Shimmer */}
                {!loading && (
                  <span
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    aria-hidden="true"
                  />
                )}
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowForwardRoundedIcon
                      sx={{ fontSize: 16 }}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[9px] text-ink-disabled font-bold uppercase tracking-[0.2em] animate-fade-in delay-500">
            © 2026 Sigmatronics Private Ltd
          </p>
        </div>
      </div>
    </div>
  );
}
