import type { NetworkRelationship } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface NetworkState {
  items: NetworkRelationship[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface NetworkActions {
  setNetworkRelationships: (relationships: NetworkRelationship[]) => void;
  setSelectedNetwork: (id: string | null) => void;
  setNetworkFilters: (filters: Record<string, unknown>) => void;
  setNetworkLoading: (loading: boolean) => void;
  setNetworkError: (error: string | null) => void;
  resetNetwork: () => void;
}

export type NetworkSlice = NetworkState & NetworkActions;

const initialState: NetworkState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createNetworkSlice: StoreSlice<NetworkSlice> = (set) => ({
  ...initialState,

  setNetworkRelationships: (relationships) =>
    set((state) => {
      state.network.items = relationships;
      state.network.isLoading = false;
      state.network.error = null;
    }),

  setSelectedNetwork: (id) =>
    set((state) => {
      state.network.selectedId = id;
    }),

  setNetworkFilters: (filters) =>
    set((state) => {
      state.network.filters = filters;
    }),

  setNetworkLoading: (loading) =>
    set((state) => {
      state.network.isLoading = loading;
    }),

  setNetworkError: (error) =>
    set((state) => {
      state.network.error = error;
      state.network.isLoading = false;
    }),

  resetNetwork: () =>
    set((state) => {
      state.network.items = initialState.items;
      state.network.selectedId = initialState.selectedId;
      state.network.filters = initialState.filters;
      state.network.isLoading = initialState.isLoading;
      state.network.error = initialState.error;
    }),
});
