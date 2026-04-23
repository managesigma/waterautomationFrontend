'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Mobile is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      interface LoginResponse {
        success: boolean;
        message: string;
        data: {
          accessToken: string;
          deploymentType: 'SAAS' | 'ON_PREM';
          apiBaseUrl: string;
          user: { role: 'SIGMA_ADMIN' | 'PMC_ADMIN' | 'CONTRACTOR' | 'DRIVER' };
        };
      }

      const response = (await api.post<LoginResponse>('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      })) as unknown as LoginResponse;

      const { accessToken, deploymentType, apiBaseUrl, user } = response.data;

      setAuth({
        jwt: accessToken,
        deploymentType,
        apiBaseUrl,
        userRole: user.role,
        user,
      });

      toast.success('Logged in successfully');

      // Routing logic based on role
      switch (user.role) {
        case 'SIGMA_ADMIN':
          router.push('/sigma-admin');
          break;
        case 'PMC_ADMIN':
          router.push('/pmc-admin');
          break;
        case 'CONTRACTOR':
          router.push('/contractor');
          break;
        default:
          router.push('/login');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to your Sigmatronics account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-main)]">Email or Mobile</label>
          <input
            type="text"
            {...register('identifier')}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.identifier ? 'border-red-500' : 'border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive)] bg-gray-50 focus:bg-white transition-all`}
            placeholder="Enter your email or mobile"
          />
          {errors.identifier && (
            <span className="text-xs text-red-500 mt-1 flex items-center">{errors.identifier.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-main)]">Password</label>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive)] bg-gray-50 focus:bg-white transition-all`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <span className="text-xs text-red-500 mt-1 flex items-center">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[var(--color-interactive)] hover:bg-[var(--color-interactive-hover)] text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
