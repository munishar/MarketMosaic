import type { User } from '@marketmosaic/shared';
import type { StoreSlice } from './index';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
}

export type AuthSlice = AuthState & AuthActions;

export const createAuthSlice: StoreSlice<AuthSlice> = (set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set((state) => {
      state.auth.user = user;
      state.auth.isAuthenticated = true;
    }),

  setTokens: (accessToken, refreshToken) =>
    set((state) => {
      state.auth.accessToken = accessToken;
      state.auth.refreshToken = refreshToken;
      state.auth.isAuthenticated = true;
    }),

  logout: () =>
    set((state) => {
      state.auth.user = null;
      state.auth.accessToken = null;
      state.auth.refreshToken = null;
      state.auth.isAuthenticated = false;
    }),

  setAuthLoading: (loading) =>
    set((state) => {
      state.auth.isLoading = loading;
    }),

  setAuthError: (error) =>
    set((state) => {
      state.auth.error = error;
    }),
});
