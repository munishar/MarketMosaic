import { NotificationType } from '../enums';
/** User notification */
export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    action_url: string | null;
    is_read: boolean;
    created_at: string;
}
//# sourceMappingURL=notification.d.ts.map