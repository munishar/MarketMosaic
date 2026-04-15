import type { Client } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface ClientState {
  items: Client[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface ClientActions {
  setClients: (clients: Client[]) => void;
  setSelectedClient: (id: string | null) => void;
  setClientFilters: (filters: Record<string, unknown>) => void;
  setClientLoading: (loading: boolean) => void;
  setClientError: (error: string | null) => void;
  resetClients: () => void;
}

export type ClientSlice = ClientState & ClientActions;

const initialState: ClientState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createClientSlice: StoreSlice<ClientSlice> = (set) => ({
  ...initialState,

  setClients: (clients) =>
    set((state) => {
      state.clients.items = clients;
      state.clients.isLoading = false;
      state.clients.error = null;
    }),

  setSelectedClient: (id) =>
    set((state) => {
      state.clients.selectedId = id;
    }),

  setClientFilters: (filters) =>
    set((state) => {
      state.clients.filters = filters;
    }),

  setClientLoading: (loading) =>
    set((state) => {
      state.clients.isLoading = loading;
    }),

  setClientError: (error) =>
    set((state) => {
      state.clients.error = error;
      state.clients.isLoading = false;
    }),

  resetClients: () =>
    set((state) => {
      state.clients.items = initialState.items;
      state.clients.selectedId = initialState.selectedId;
      state.clients.filters = initialState.filters;
      state.clients.isLoading = initialState.isLoading;
      state.clients.error = initialState.error;
    }),
});
