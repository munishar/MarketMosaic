import type { Email } from '@marketmosaic/shared';
import type { StoreSlice } from './index';

export interface EmailState {
  items: Email[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface EmailActions {
  setEmails: (emails: Email[]) => void;
  setSelectedEmail: (id: string | null) => void;
  setEmailFilters: (filters: Record<string, unknown>) => void;
  setEmailLoading: (loading: boolean) => void;
  setEmailError: (error: string | null) => void;
  resetEmails: () => void;
}

export type EmailSlice = EmailState & EmailActions;

const initialState: EmailState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createEmailSlice: StoreSlice<EmailSlice> = (set) => ({
  ...initialState,

  setEmails: (emails) =>
    set((state) => {
      state.emails.items = emails;
      state.emails.isLoading = false;
      state.emails.error = null;
    }),

  setSelectedEmail: (id) =>
    set((state) => {
      state.emails.selectedId = id;
    }),

  setEmailFilters: (filters) =>
    set((state) => {
      state.emails.filters = filters;
    }),

  setEmailLoading: (loading) =>
    set((state) => {
      state.emails.isLoading = loading;
    }),

  setEmailError: (error) =>
    set((state) => {
      state.emails.error = error;
      state.emails.isLoading = false;
    }),

  resetEmails: () =>
    set((state) => {
      state.emails.items = initialState.items;
      state.emails.selectedId = initialState.selectedId;
      state.emails.filters = initialState.filters;
      state.emails.isLoading = initialState.isLoading;
      state.emails.error = initialState.error;
    }),
});
