import type { Submission } from '@marketmosaic/shared';
import type { StoreSlice } from './index';

export interface SubmissionState {
  items: Submission[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface SubmissionActions {
  setSubmissions: (submissions: Submission[]) => void;
  setSelectedSubmission: (id: string | null) => void;
  setSubmissionFilters: (filters: Record<string, unknown>) => void;
  setSubmissionLoading: (loading: boolean) => void;
  setSubmissionError: (error: string | null) => void;
  resetSubmissions: () => void;
}

export type SubmissionSlice = SubmissionState & SubmissionActions;

const initialState: SubmissionState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createSubmissionSlice: StoreSlice<SubmissionSlice> = (set) => ({
  ...initialState,

  setSubmissions: (submissions) =>
    set((state) => {
      state.submissions.items = submissions;
      state.submissions.isLoading = false;
      state.submissions.error = null;
    }),

  setSelectedSubmission: (id) =>
    set((state) => {
      state.submissions.selectedId = id;
    }),

  setSubmissionFilters: (filters) =>
    set((state) => {
      state.submissions.filters = filters;
    }),

  setSubmissionLoading: (loading) =>
    set((state) => {
      state.submissions.isLoading = loading;
    }),

  setSubmissionError: (error) =>
    set((state) => {
      state.submissions.error = error;
      state.submissions.isLoading = false;
    }),

  resetSubmissions: () =>
    set((state) => {
      state.submissions.items = initialState.items;
      state.submissions.selectedId = initialState.selectedId;
      state.submissions.filters = initialState.filters;
      state.submissions.isLoading = initialState.isLoading;
      state.submissions.error = initialState.error;
    }),
});
