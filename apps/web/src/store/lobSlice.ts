import type { LineOfBusiness } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface LOBState {
  items: LineOfBusiness[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface LOBActions {
  setLOBs: (lobs: LineOfBusiness[]) => void;
  setSelectedLOB: (id: string | null) => void;
  setLOBFilters: (filters: Record<string, unknown>) => void;
  setLOBLoading: (loading: boolean) => void;
  setLOBError: (error: string | null) => void;
  resetLOBs: () => void;
}

export type LOBSlice = LOBState & LOBActions;

const initialState: LOBState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createLOBSlice: StoreSlice<LOBSlice> = (set) => ({
  ...initialState,

  setLOBs: (lobs) =>
    set((state) => {
      state.lobs.items = lobs;
      state.lobs.isLoading = false;
      state.lobs.error = null;
    }),

  setSelectedLOB: (id) =>
    set((state) => {
      state.lobs.selectedId = id;
    }),

  setLOBFilters: (filters) =>
    set((state) => {
      state.lobs.filters = filters;
    }),

  setLOBLoading: (loading) =>
    set((state) => {
      state.lobs.isLoading = loading;
    }),

  setLOBError: (error) =>
    set((state) => {
      state.lobs.error = error;
      state.lobs.isLoading = false;
    }),

  resetLOBs: () =>
    set((state) => {
      state.lobs.items = initialState.items;
      state.lobs.selectedId = initialState.selectedId;
      state.lobs.filters = initialState.filters;
      state.lobs.isLoading = initialState.isLoading;
      state.lobs.error = initialState.error;
    }),
});
