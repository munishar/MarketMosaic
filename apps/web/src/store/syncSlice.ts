import type { SyncSchedule, SyncJob, AMSConnection } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface SyncState {
  schedules: SyncSchedule[];
  jobs: SyncJob[];
  connections: AMSConnection[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

export interface SyncActions {
  setSyncSchedules: (schedules: SyncSchedule[]) => void;
  setSyncJobs: (jobs: SyncJob[]) => void;
  setAMSConnections: (connections: AMSConnection[]) => void;
  setSelectedSync: (id: string | null) => void;
  setSyncFilters: (filters: Record<string, unknown>) => void;
  setSyncLoading: (loading: boolean) => void;
  setSyncError: (error: string | null) => void;
  resetSync: () => void;
}

export type SyncSlice = SyncState & SyncActions;

const initialState: SyncState = {
  schedules: [],
  jobs: [],
  connections: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const createSyncSlice: StoreSlice<SyncSlice> = (set) => ({
  ...initialState,

  setSyncSchedules: (schedules) =>
    set((state) => {
      state.sync.schedules = schedules;
    }),

  setSyncJobs: (jobs) =>
    set((state) => {
      state.sync.jobs = jobs;
    }),

  setAMSConnections: (connections) =>
    set((state) => {
      state.sync.connections = connections;
    }),

  setSelectedSync: (id) =>
    set((state) => {
      state.sync.selectedId = id;
    }),

  setSyncFilters: (filters) =>
    set((state) => {
      state.sync.filters = filters;
    }),

  setSyncLoading: (loading) =>
    set((state) => {
      state.sync.isLoading = loading;
    }),

  setSyncError: (error) =>
    set((state) => {
      state.sync.error = error;
      state.sync.isLoading = false;
    }),

  resetSync: () =>
    set((state) => {
      state.sync.schedules = initialState.schedules;
      state.sync.jobs = initialState.jobs;
      state.sync.connections = initialState.connections;
      state.sync.selectedId = initialState.selectedId;
      state.sync.filters = initialState.filters;
      state.sync.isLoading = initialState.isLoading;
      state.sync.error = initialState.error;
    }),
});
