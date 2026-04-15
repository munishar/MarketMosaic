import type { Contact } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface ContactState {
  items: Contact[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface ContactActions {
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (id: string | null) => void;
  setContactFilters: (filters: Record<string, unknown>) => void;
  setContactLoading: (loading: boolean) => void;
  setContactError: (error: string | null) => void;
  resetContacts: () => void;
}

export type ContactSlice = ContactState & ContactActions;

const initialState: ContactState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createContactSlice: StoreSlice<ContactSlice> = (set) => ({
  ...initialState,

  setContacts: (contacts) =>
    set((state) => {
      state.contacts.items = contacts;
      state.contacts.isLoading = false;
      state.contacts.error = null;
    }),

  setSelectedContact: (id) =>
    set((state) => {
      state.contacts.selectedId = id;
    }),

  setContactFilters: (filters) =>
    set((state) => {
      state.contacts.filters = filters;
    }),

  setContactLoading: (loading) =>
    set((state) => {
      state.contacts.isLoading = loading;
    }),

  setContactError: (error) =>
    set((state) => {
      state.contacts.error = error;
      state.contacts.isLoading = false;
    }),

  resetContacts: () =>
    set((state) => {
      state.contacts.items = initialState.items;
      state.contacts.selectedId = initialState.selectedId;
      state.contacts.filters = initialState.filters;
      state.contacts.isLoading = initialState.isLoading;
      state.contacts.error = initialState.error;
    }),
});
