import type { StoreSlice } from './index';

export interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  globalSearchOpen: boolean;
  aiPanelOpen: boolean;
  theme: 'light' | 'dark';
  activeModal: string | null;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleGlobalSearch: () => void;
  setGlobalSearchOpen: (open: boolean) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveModal: (modal: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export type UISlice = UIState & UIActions;

let toastCounter = 0;

export const createUISlice: StoreSlice<UISlice> = (set) => ({
  sidebarCollapsed: false,
  sidebarOpen: true,
  globalSearchOpen: false,
  aiPanelOpen: false,
  theme: 'light',
  activeModal: null,
  toasts: [],

  toggleSidebar: () =>
    set((state) => {
      state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
    }),

  setSidebarOpen: (open) =>
    set((state) => {
      state.ui.sidebarOpen = open;
    }),

  toggleGlobalSearch: () =>
    set((state) => {
      state.ui.globalSearchOpen = !state.ui.globalSearchOpen;
    }),

  setGlobalSearchOpen: (open) =>
    set((state) => {
      state.ui.globalSearchOpen = open;
    }),

  toggleAIPanel: () =>
    set((state) => {
      state.ui.aiPanelOpen = !state.ui.aiPanelOpen;
    }),

  setAIPanelOpen: (open) =>
    set((state) => {
      state.ui.aiPanelOpen = open;
    }),

  setTheme: (theme) =>
    set((state) => {
      state.ui.theme = theme;
    }),

  setActiveModal: (modal) =>
    set((state) => {
      state.ui.activeModal = modal;
    }),

  addToast: (toast) =>
    set((state) => {
      toastCounter += 1;
      state.ui.toasts.push({ ...toast, id: `toast-${toastCounter}` });
    }),

  removeToast: (id) =>
    set((state) => {
      state.ui.toasts = state.ui.toasts.filter((t) => t.id !== id);
    }),
});
