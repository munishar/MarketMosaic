import type { Notification } from '@brokerflow/shared';
import type { StoreSlice } from './index';

export interface NotificationState {
  items: Notification[];
  selectedId: string | null;
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  setSelectedNotification: (id: string | null) => void;
  setNotificationFilters: (filters: Record<string, unknown>) => void;
  setNotificationLoading: (loading: boolean) => void;
  setNotificationError: (error: string | null) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resetNotifications: () => void;
}

export type NotificationSlice = NotificationState & NotificationActions;

const initialState: NotificationState = {
  items: [],
  selectedId: null,
  filters: {},
  isLoading: false,
  error: null,
  unreadCount: 0,
};

export const createNotificationSlice: StoreSlice<NotificationSlice> = (set) => ({
  ...initialState,

  setNotifications: (notifications) =>
    set((state) => {
      state.notifications.items = notifications;
      state.notifications.unreadCount = notifications.filter((n) => !n.is_read).length;
      state.notifications.isLoading = false;
      state.notifications.error = null;
    }),

  setSelectedNotification: (id) =>
    set((state) => {
      state.notifications.selectedId = id;
    }),

  setNotificationFilters: (filters) =>
    set((state) => {
      state.notifications.filters = filters;
    }),

  setNotificationLoading: (loading) =>
    set((state) => {
      state.notifications.isLoading = loading;
    }),

  setNotificationError: (error) =>
    set((state) => {
      state.notifications.error = error;
      state.notifications.isLoading = false;
    }),

  markAsRead: (id) =>
    set((state) => {
      const item = state.notifications.items.find((n) => n.id === id);
      if (item && !item.is_read) {
        item.is_read = true;
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    }),

  markAllAsRead: () =>
    set((state) => {
      state.notifications.items.forEach((n) => {
        n.is_read = true;
      });
      state.notifications.unreadCount = 0;
    }),

  resetNotifications: () =>
    set((state) => {
      state.notifications.items = initialState.items;
      state.notifications.selectedId = initialState.selectedId;
      state.notifications.filters = initialState.filters;
      state.notifications.isLoading = initialState.isLoading;
      state.notifications.error = initialState.error;
      state.notifications.unreadCount = initialState.unreadCount;
    }),
});
