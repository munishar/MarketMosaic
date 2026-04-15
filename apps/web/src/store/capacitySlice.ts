import type { UnderwriterCapacity } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface CapacityState {
  items: UnderwriterCapacity[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface CapacityActions {
  setCapacities: (capacities: UnderwriterCapacity[]) => void;
  setSelectedCapacity: (id: string | null) => void;
  setCapacityFilters: (filters: Record<string, unknown>) => void;
  setCapacityLoading: (loading: boolean) => void;
  setCapacityError: (error: string | null) => void;
  resetCapacities: () => void;
}

export type CapacitySlice = CapacityState & CapacityActions;

const initialState: CapacityState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createCapacitySlice: StoreSlice<CapacitySlice> = (set) => ({
  ...initialState,

  setCapacities: (capacities) =>
    set((state) => {
      state.capacities.items = capacities;
      state.capacities.isLoading = false;
      state.capacities.error = null;
    }),

  setSelectedCapacity: (id) =>
    set((state) => {
      state.capacities.selectedId = id;
    }),

  setCapacityFilters: (filters) =>
    set((state) => {
      state.capacities.filters = filters;
    }),

  setCapacityLoading: (loading) =>
    set((state) => {
      state.capacities.isLoading = loading;
    }),

  setCapacityError: (error) =>
    set((state) => {
      state.capacities.error = error;
      state.capacities.isLoading = false;
    }),

  resetCapacities: () =>
    set((state) => {
      state.capacities.items = initialState.items;
      state.capacities.selectedId = initialState.selectedId;
      state.capacities.filters = initialState.filters;
      state.capacities.isLoading = initialState.isLoading;
      state.capacities.error = initialState.error;
    }),
});
