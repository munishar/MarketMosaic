import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type AuthSlice, createAuthSlice } from './authSlice';
import { type UISlice, createUISlice } from './uiSlice';
import { type ClientSlice, createClientSlice } from './clientSlice';
import { type ContactSlice, createContactSlice } from './contactSlice';
import { type CarrierSlice, createCarrierSlice } from './carrierSlice';
import { type LOBSlice, createLOBSlice } from './lobSlice';
import { type CapacitySlice, createCapacitySlice } from './capacitySlice';
import { type SubmissionSlice, createSubmissionSlice } from './submissionSlice';
import { type EmailSlice, createEmailSlice } from './emailSlice';
import { type NetworkSlice, createNetworkSlice } from './networkSlice';
import { type ActivitySlice, createActivitySlice } from './activitySlice';
import { type NotificationSlice, createNotificationSlice } from './notificationSlice';
import { type SyncSlice, createSyncSlice } from './syncSlice';
import { type ConfigSlice, createConfigSlice } from './configSlice';

export interface AppState {
  auth: AuthSlice;
  ui: UISlice;
  clients: ClientSlice;
  contacts: ContactSlice;
  carriers: CarrierSlice;
  lobs: LOBSlice;
  capacities: CapacitySlice;
  submissions: SubmissionSlice;
  emails: EmailSlice;
  network: NetworkSlice;
  activities: ActivitySlice;
  notifications: NotificationSlice;
  sync: SyncSlice;
  config: ConfigSlice;

  // Auth top-level actions
  setUser: AuthSlice['setUser'];
  setTokens: AuthSlice['setTokens'];
  logout: AuthSlice['logout'];

  // UI top-level actions
  toggleSidebar: UISlice['toggleSidebar'];
  toggleGlobalSearch: UISlice['toggleGlobalSearch'];
  toggleAIPanel: UISlice['toggleAIPanel'];
  addToast: UISlice['addToast'];
  removeToast: UISlice['removeToast'];
}

/** Slice creator type for use in individual slice files */
export type StoreSlice<T> = (
  set: (fn: (state: AppState) => void) => void,
  get: () => AppState,
) => T;

export const useAppStore = create<AppState>()(
  immer((set, get) => {
    const authSlice = createAuthSlice(set, get);
    const uiSlice = createUISlice(set, get);
    const clientSlice = createClientSlice(set, get);
    const contactSlice = createContactSlice(set, get);
    const carrierSlice = createCarrierSlice(set, get);
    const lobSlice = createLOBSlice(set, get);
    const capacitySlice = createCapacitySlice(set, get);
    const submissionSlice = createSubmissionSlice(set, get);
    const emailSlice = createEmailSlice(set, get);
    const networkSlice = createNetworkSlice(set, get);
    const activitySlice = createActivitySlice(set, get);
    const notificationSlice = createNotificationSlice(set, get);
    const syncSlice = createSyncSlice(set, get);
    const configSlice = createConfigSlice(set, get);

    return {
      auth: authSlice,
      ui: uiSlice,
      clients: clientSlice,
      contacts: contactSlice,
      carriers: carrierSlice,
      lobs: lobSlice,
      capacities: capacitySlice,
      submissions: submissionSlice,
      emails: emailSlice,
      network: networkSlice,
      activities: activitySlice,
      notifications: notificationSlice,
      sync: syncSlice,
      config: configSlice,

      // Promoted auth actions
      setUser: authSlice.setUser,
      setTokens: authSlice.setTokens,
      logout: authSlice.logout,

      // Promoted UI actions
      toggleSidebar: uiSlice.toggleSidebar,
      toggleGlobalSearch: uiSlice.toggleGlobalSearch,
      toggleAIPanel: uiSlice.toggleAIPanel,
      addToast: uiSlice.addToast,
      removeToast: uiSlice.removeToast,
    };
  }),
);
