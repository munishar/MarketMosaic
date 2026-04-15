import type { Carrier } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface CarrierState {
  items: Carrier[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface CarrierActions {
  setCarriers: (carriers: Carrier[]) => void;
  setSelectedCarrier: (id: string | null) => void;
  setCarrierFilters: (filters: Record<string, unknown>) => void;
  setCarrierLoading: (loading: boolean) => void;
  setCarrierError: (error: string | null) => void;
  resetCarriers: () => void;
}

export type CarrierSlice = CarrierState & CarrierActions;

const initialState: CarrierState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createCarrierSlice: StoreSlice<CarrierSlice> = (set) => ({
  ...initialState,

  setCarriers: (carriers) =>
    set((state) => {
      state.carriers.items = carriers;
      state.carriers.isLoading = false;
      state.carriers.error = null;
    }),

  setSelectedCarrier: (id) =>
    set((state) => {
      state.carriers.selectedId = id;
    }),

  setCarrierFilters: (filters) =>
    set((state) => {
      state.carriers.filters = filters;
    }),

  setCarrierLoading: (loading) =>
    set((state) => {
      state.carriers.isLoading = loading;
    }),

  setCarrierError: (error) =>
    set((state) => {
      state.carriers.error = error;
      state.carriers.isLoading = false;
    }),

  resetCarriers: () =>
    set((state) => {
      state.carriers.items = initialState.items;
      state.carriers.selectedId = initialState.selectedId;
      state.carriers.filters = initialState.filters;
      state.carriers.isLoading = initialState.isLoading;
      state.carriers.error = initialState.error;
    }),
});
