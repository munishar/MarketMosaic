import type { StoreSlice } from './index';

export interface ConfigState {
  manifests: Record<string, unknown>[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface ConfigActions {
  setManifests: (manifests: Record<string, unknown>[]) => void;
  setSelectedConfig: (id: string | null) => void;
  setConfigFilters: (filters: Record<string, unknown>) => void;
  setConfigLoading: (loading: boolean) => void;
  setConfigError: (error: string | null) => void;
  resetConfig: () => void;
}

export type ConfigSlice = ConfigState & ConfigActions;

const initialState: ConfigState = {
  manifests: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createConfigSlice: StoreSlice<ConfigSlice> = (set) => ({
  ...initialState,

  setManifests: (manifests) =>
    set((state) => {
      state.config.manifests = manifests;
      state.config.isLoading = false;
      state.config.error = null;
    }),

  setSelectedConfig: (id) =>
    set((state) => {
      state.config.selectedId = id;
    }),

  setConfigFilters: (filters) =>
    set((state) => {
      state.config.filters = filters;
    }),

  setConfigLoading: (loading) =>
    set((state) => {
      state.config.isLoading = loading;
    }),

  setConfigError: (error) =>
    set((state) => {
      state.config.error = error;
      state.config.isLoading = false;
    }),

  resetConfig: () =>
    set((state) => {
      state.config.manifests = initialState.manifests;
      state.config.selectedId = initialState.selectedId;
      state.config.filters = initialState.filters;
      state.config.isLoading = initialState.isLoading;
      state.config.error = initialState.error;
    }),
});
