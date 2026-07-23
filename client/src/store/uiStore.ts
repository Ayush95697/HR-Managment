import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
  modalData: unknown;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useUIStore = create<UIState>((set) => {
  const initialTheme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  return {
    theme: initialTheme,
    sidebarOpen: true,
    activeModal: null,
    modalData: null,

    toggleTheme: () => set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    openModal: (modalId: string, data?: unknown) => set({ activeModal: modalId, modalData: data }),

    closeModal: () => set({ activeModal: null, modalData: null }),
  };
});
