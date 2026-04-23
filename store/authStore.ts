import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SIGMA_ADMIN' | 'PMC_ADMIN' | 'CONTRACTOR' | 'DRIVER' | null;

interface AuthState {
  jwt: string | null;
  apiBaseUrl: string | null;
  deploymentType: 'SAAS' | 'ON_PREM' | null;
  userRole: UserRole;
  user: any | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (data: { jwt: string; apiBaseUrl: string; deploymentType: 'SAAS' | 'ON_PREM'; userRole: UserRole; user?: any }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      jwt: null,
      apiBaseUrl: null,
      deploymentType: null,
      userRole: null,
      user: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (data) => set({ ...data }),
      clearAuth: () => set({ jwt: null, apiBaseUrl: null, deploymentType: null, userRole: null, user: null }),
    }),
    {
      name: 'sigmatronics-auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
