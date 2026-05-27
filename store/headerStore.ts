import { create } from 'zustand';

interface HeaderState {
  title: string | null;
  subtitle: string | null;
  category: string | null;
  setHeader: (header: { title: string | null; subtitle: string | null; category?: string | null }) => void;
  resetHeader: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: null,
  subtitle: null,
  category: null,
  setHeader: (header) => set({ 
    title: header.title, 
    subtitle: header.subtitle, 
    category: header.category !== undefined ? header.category : null 
  }),
  resetHeader: () => set({ title: null, subtitle: null, category: null }),
}));
