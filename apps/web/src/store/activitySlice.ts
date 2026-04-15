import type { Activity } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface ActivityState {
  items: Activity[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface ActivityActions {
  setActivities: (activities: Activity[]) => void;
  setSelectedActivity: (id: string | null) => void;
  setActivityFilters: (filters: Record<string, unknown>) => void;
  setActivityLoading: (loading: boolean) => void;
  setActivityError: (error: string | null) => void;
  resetActivities: () => void;
}

export type ActivitySlice = ActivityState & ActivityActions;

const initialState: ActivityState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createActivitySlice: StoreSlice<ActivitySlice> = (set) => ({
  ...initialState,

  setActivities: (activities) =>
    set((state) => {
      state.activities.items = activities;
      state.activities.isLoading = false;
      state.activities.error = null;
    }),

  setSelectedActivity: (id) =>
    set((state) => {
      state.activities.selectedId = id;
    }),

  setActivityFilters: (filters) =>
    set((state) => {
      state.activities.filters = filters;
    }),

  setActivityLoading: (loading) =>
    set((state) => {
      state.activities.isLoading = loading;
    }),

  setActivityError: (error) =>
    set((state) => {
      state.activities.error = error;
      state.activities.isLoading = false;
    }),

  resetActivities: () =>
    set((state) => {
      state.activities.items = initialState.items;
      state.activities.selectedId = initialState.selectedId;
      state.activities.filters = initialState.filters;
      state.activities.isLoading = initialState.isLoading;
      state.activities.error = initialState.error;
    }),
});
